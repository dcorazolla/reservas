import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Box, Heading, VStack, Button } from '@chakra-ui/react'
import { useAuth } from '@contexts/AuthContext'
import { decodeJwtPayload } from '@utils/jwt'
import RatesField from '@components/Shared/RatesField/RatesField'
import FormField from '@components/Shared/FormField/FormField'
import SkeletonFields from '@components/Shared/Skeleton/SkeletonFields'
import { propertySchema, type PropertyFormData } from '@models/schemas'
import * as propertiesService from '@services/properties'
import type { Property } from '@models/property'

export default function BaseRatesPage() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)
  const [showRates, setShowRates] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  })

  // Carregar propriedade ativa (property_id do JWT)
  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true)
        const payload: any = decodeJwtPayload(token)
        const propertyId = payload?.property_id

        if (!propertyId) {
          throw new Error('No property_id found in JWT')
        }
        
        const data = await propertiesService.getProperty(propertyId)
        setProperty(data)
        reset({
          name: data.name,
          timezone: data.timezone,
          infant_max_age: data.infant_max_age ?? undefined,
          child_max_age: data.child_max_age ?? undefined,
          child_factor: data.child_factor ?? undefined,
          base_one_adult: data.base_one_adult ?? undefined,
          base_two_adults: data.base_two_adults ?? undefined,
          additional_adult: data.additional_adult ?? undefined,
          child_price: data.child_price ?? undefined,
        })
      } catch (error) {
        console.error('Error loading property:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [token, reset])

  async function handleSave(data: PropertyFormData) {
    if (!property?.id) return

    try {
      setSaving(true)
      const updated = await propertiesService.updateProperty(property.id, {
        name: data.name.trim(),
        timezone: data.timezone,
        infant_max_age: data.infant_max_age ?? null,
        child_max_age: data.child_max_age ?? null,
        child_factor: data.child_factor ?? null,
        base_one_adult: data.base_one_adult ?? null,
        base_two_adults: data.base_two_adults ?? null,
        additional_adult: data.additional_adult ?? null,
        child_price: data.child_price ?? null,
      })
      setProperty(updated)
      setShowRates(false)
      console.log('Base rates saved successfully')
    } catch (error) {
      console.error('Error saving rates:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="lg">
          {t('menu.rates.base')}
        </Heading>
        <SkeletonFields rows={5} />
      </VStack>
    )
  }

  if (!property) {
    return (
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="lg">
          {t('menu.rates.base')}
        </Heading>
        <Box>{t('common.status.no_data')}</Box>
      </VStack>
    )
  }

  return (
    <VStack spacing={6} align="stretch" as="form" onSubmit={handleSubmit(handleSave)}>
      <Heading as="h2" size="lg">
        {t('menu.rates.base')}
      </Heading>

      <Box>
        <Heading as="h3" size="md" mb={2}>
          {t('properties.form.base_rates_title')}
        </Heading>
        <Box mb={6} color="gray.600" fontSize="sm">
          {t('baseRates.form.description')}
        </Box>

        <VStack spacing={4} align="stretch">
          <FormField
            label={t('properties.form.name')}
            name="name"
            errors={errors}
          >
            <input type="text" {...register('name')} disabled />
          </FormField>

          <FormField
            label={t('properties.form.timezone')}
            name="timezone"
            errors={errors}
          >
            <input type="text" {...register('timezone')} disabled />
          </FormField>

          <FormField
            label={t('common.pricing.infant_max_age')}
            name="infant_max_age"
            errors={errors}
          >
            <input type="number" {...register('infant_max_age')} disabled />
          </FormField>

          <FormField
            label={t('common.pricing.child_max_age')}
            name="child_max_age"
            errors={errors}
          >
            <input type="number" {...register('child_max_age')} disabled />
          </FormField>
        </VStack>
      </Box>

      <RatesField
        control={control}
        errors={errors}
        showRates={showRates}
        onToggleRates={setShowRates}
        title="properties.form.base_rates_title"
        toggleLabel="common.pricing.show_rates"
        hideLabel="common.pricing.hide_rates"
      />

      <Button
        type="submit"
        colorScheme="blue"
        isLoading={saving}
        alignSelf="flex-start"
      >
        {t('common.actions.save')}
      </Button>
    </VStack>
  )
}
