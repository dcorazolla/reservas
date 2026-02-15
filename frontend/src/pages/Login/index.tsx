import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormErrorMessage,
  Text,
  Skeleton,
} from '@chakra-ui/react'
import { login } from '../../services/auth'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha muito curta'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormValues) {
    setServerError(null)
    try {
      await login(data)
      // success path: redirect or show toast (left as TODO)
    } catch (err: any) {
      setServerError(err?.message || 'Erro desconhecido')
    }
  }

  if (isSubmitting) {
    return <Skeleton height="240px" data-testid="login-skeleton" />
  }

  return (
    <VStack align="stretch" spacing={4} as="form" onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={!!errors.email}>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input id="email" type="email" {...register('email')} />
        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.password}>
        <FormLabel htmlFor="password">Senha</FormLabel>
        <Input id="password" type="password" {...register('password')} />
        <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
      </FormControl>

      {serverError && (
        <Text role="alert" color="red.500">
          {serverError}
        </Text>
      )}

      <Button type="submit" colorScheme="blue">
        Entrar
      </Button>
    </VStack>
  )
}
