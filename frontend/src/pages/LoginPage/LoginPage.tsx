import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Box,
  VStack,
  /* v3 field primitives */
  FieldRoot,
  FieldLabel,
  FieldErrorText,
  Input,
  Button,
  Skeleton,
  Heading,
  HStack,
  Link,
  VisuallyHidden,
  Text,
  Flex,
} from '@chakra-ui/react'
// Use Box as select to avoid incompatible Chakra Select export in current package
import { useTranslation } from 'react-i18next'
import { useAuth } from '@contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { decodeTokenPayload } from '@services/auth'
import './login-page.css'
import { FaGoogle, FaFacebookF } from 'react-icons/fa'
import { AiOutlineWarning } from 'react-icons/ai'
import { LanguageSelector } from '@components/LanguageSelector'

const schema = z.object({
  email: z.string().email('login.email_error' as any),
  password: z.string().min(6, 'login.password_error' as any),
  remember: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { t, i18n } = useTranslation('common')
  const { login, token, logout } = useAuth()
  const navigate = useNavigate()

  // If user arrives at /login but already has a valid token, redirect to home
  useEffect(() => {
    try {
      if (!token) return
      const payload: any = decodeTokenPayload(token)
      const exp = payload?.exp ? payload.exp * 1000 : null
      if (exp && exp > Date.now()) {
        navigate('/', { replace: true })
      } else {
        // token expired -> ensure logout clears storage
        logout()
      }
    } catch (e) {
      // ignore
    }
  }, [token, navigate, logout])
  // Remove debug logs (they were useful for diagnosing invalid Chakra namespace exports)

  // Note: some Chakra exports are namespace objects (e.g., `Checkbox` is a namespace).
  // We'll avoid using `Checkbox` as a component and render a native checkbox instead.
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<{ type: 'info' | 'error'; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setFocus,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  // When browser autofills credentials, inputs may show values without firing
  // input/change events. Read DOM values on mount and populate the form state
  // so validation won't falsely mark fields as empty and focus will behave
  // predictably.
  useEffect(() => {
    const emailEl = document.getElementById('email') as HTMLInputElement | null
    const passEl = document.getElementById('password') as HTMLInputElement | null
    let populated = false

    if (emailEl?.value) {
      setValue('email', emailEl.value, { shouldValidate: false, shouldDirty: true })
      populated = true
    }
    if (passEl?.value) {
      setValue('password', passEl.value, { shouldValidate: false, shouldDirty: true })
      populated = true
    }

    // If values were populated and there are no errors, we can optionally
    // move focus to password (common UX) or leave it. We'll leave focus
    // untouched; validation will run on submit.
    if (populated) {
      // no-op for now; this ensures form has initial values from autofill
    }
  }, [setValue])

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    setNotice(null)
    try {
      await login(values.email, values.password, Boolean(values.remember))
      // login() will navigate to /
    } catch (e: any) {
      // extract message from axios response if available
      const apiMsg = e?.response?.data?.message
      const message = apiMsg || e?.message || t('login.error', 'Falha ao autenticar — verifique suas credenciais.')
      setNotice({ type: 'error', message })
      setSubmitting(false)
    }
  }

  function clearNotice() {
    if (notice) setNotice(null)
  }

  if (submitting) {
    return <Skeleton height="240px" data-testid="login-skeleton" />
  }

  return (
    <Box maxW={{ base: '100%', md: '420px' }} mx="auto" px={4} py={6}>
      {notice && (
        <Box mb={4} role={notice.type === 'error' ? 'alert' : undefined}>
          <HStack spacing={3} align="center" bg={notice.type === 'error' ? 'red.50' : 'blue.50'} borderRadius="md" p={3}>
            <Box color={notice.type === 'error' ? 'red.600' : 'blue.600'}>
              <AiOutlineWarning size={20} aria-hidden />
            </Box>
            <Box>
              <Text color={notice.type === 'error' ? 'red.700' : 'blue.800'} fontSize="sm">
                {notice.message}
              </Text>
            </Box>
          </HStack>
        </Box>
      )}

      <Box className="login-card" p={{ base: 4, md: 6 }}>
        <VStack spacing={4} align="stretch" as="form" onSubmit={handleSubmit(onSubmit)}>
                <Flex justify="space-between" align="center">
                  <Heading as="h1" size="lg">
                    {t('login.title')}
                  </Heading>
                  <LanguageSelector />
                </Flex>

                <Text color="gray.600">{t('login.subtitle', 'Entre na sua conta para continuar')}</Text>

          <FieldRoot>
            <FieldLabel htmlFor="email">{t('login.email')}</FieldLabel>
            <Input
              id="email"
              autoComplete="username"
              type="email"
              placeholder={t('login.email_placeholder', 'seu@email.com')}
              aria-invalid={!!errors.email}
              {...register('email')}
              onChange={() => clearNotice()}
            />
            <FieldErrorText>{errors.email ? String(errors.email.message) : null}</FieldErrorText>
          </FieldRoot>

          <FieldRoot>
            <FieldLabel htmlFor="password">{t('login.password')}</FieldLabel>
            <Input
              id="password"
              autoComplete="current-password"
              type="password"
              placeholder={t('login.password_placeholder', '••••••••')}
              aria-invalid={!!errors.password}
              {...register('password')}
              onChange={() => clearNotice()}
            />
            <FieldErrorText>{errors.password ? String(errors.password.message) : null}</FieldErrorText>
          </FieldRoot>

          <Flex align="center" justify="space-between">
            <label className="remember-label">
              <input type="checkbox" {...register('remember')} />
              <span>{t('login.remember_me', 'Lembrar-me')}</span>
            </label>
            <Link href="#" color="blue.600">
              {t('login.forgot', 'Esqueceu a senha?')}
            </Link>
          </Flex>

          <Button type="submit" colorScheme="blue" aria-label={t('login.submit')}>
            {t('login.submit')}
          </Button>

          <div className="or-divider">{t('login.or', 'ou')}</div>
          <div className="social-row">
            <Button
              className="social-btn"
              variant="outline"
              onClick={() => setNotice(t('login.social_google_notice', 'Login com Google não habilitado neste protótipo'))}
            >
              <FaGoogle size={16} aria-hidden />
              {t('login.social_google', 'Entrar com Google')}
            </Button>
            <Button
              className="social-btn"
              variant="outline"
              onClick={() => setNotice(t('login.social_facebook_notice', 'Login com Facebook não habilitado neste protótipo'))}
            >
              <FaFacebookF size={16} aria-hidden />
              {t('login.social_facebook', 'Entrar com Facebook')}
            </Button>
          </div>

          <Text fontSize="sm" color="gray.600" className="login-page-footer">
            {t('login.no_account', "Não tem uma conta?")}{' '}
            <Link href="#" color="blue.600">
              {t('login.create_account', 'Criar conta')}
            </Link>
          </Text>

          <VisuallyHidden aria-live="polite">{t('login.accessible_help', 'Preencha o formulário para entrar')}</VisuallyHidden>
        </VStack>
      </Box>
    </Box>
  )
}

export default LoginPage
