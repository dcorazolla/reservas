import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormErrorMessage,
  Skeleton,
  Heading,
  HStack,
  Link,
  useToast,
  VisuallyHidden,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import './login-page.css'

const schema = z.object({
  email: z.string().email('login.email_error' as any),
  password: z.string().min(6, 'login.password_error' as any),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { t } = useTranslation('common')
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function onSubmit(_: FormValues) {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      toast({
        title: t('login.title'),
        description: t('login.demo_notice', 'Funcionalidade de login não implementada neste protótipo.'),
        status: 'info',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }, 700)
  }

  if (submitting) {
    return <Skeleton height="240px" data-testid="login-skeleton" />
  }

  return (
    <Box maxW={{ base: '100%', md: '420px' }} mx="auto" px={4} py={6}>
      <VStack spacing={6} align="stretch" as="form" onSubmit={handleSubmit(onSubmit)}>
        <Heading as="h1" size="lg">
          {t('login.title')}
        </Heading>

        <FormControl isInvalid={!!errors.email}>
          <FormLabel htmlFor="email">{t('login.email')}</FormLabel>
          <Input
            id="email"
            type="email"
            placeholder={t('login.email_placeholder', 'seu@email.com')}
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          <FormErrorMessage>{errors.email ? String(errors.email.message) : null}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <FormLabel htmlFor="password">{t('login.password')}</FormLabel>
          <Input
            id="password"
            type="password"
            placeholder={t('login.password_placeholder', '••••••••')}
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          <FormErrorMessage>{errors.password ? String(errors.password.message) : null}</FormErrorMessage>
        </FormControl>

        <HStack justify="space-between">
          <Link href="#" color="blue.600">
            {t('login.forgot', 'Esqueceu a senha?')}
          </Link>
          <Link href="#" color="blue.600">
            {t('login.create_account', 'Criar conta')}
          </Link>
        </HStack>

        <Button type="submit" colorScheme="blue" aria-label={t('login.submit')}>
          {t('login.submit')}
        </Button>

        <VisuallyHidden aria-live="polite">{t('login.accessible_help', 'Preencha o formulário para entrar')}</VisuallyHidden>
      </VStack>
    </Box>
  )
}

export default LoginPage
