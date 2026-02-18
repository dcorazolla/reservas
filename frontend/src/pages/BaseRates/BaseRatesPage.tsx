import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Box, Heading, VStack, Button, Grid, GridItem } from '@chakra-ui/react'
import { useAuth } from '@contexts/AuthContext'
import { decodeJwtPayload } from '@utils/jwt'
import FormField from '@components/Shared/FormField/FormField'
import CurrencyInput from '@components/Shared/CurrencyInput/CurrencyInput'
import SkeletonFields from '@components/Shared/Skeleton/SkeletonFields'
import { propertySchema, baseRatesSchema, type BaseRatesFormData } from '@models/schemas'
import * as propertiesService from '@services/properties'
import type { Property } from '@models/property'

export default function BaseRatesPage() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BaseRatesFormData>({
    resolver: zodResolver(baseRatesSchema),
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

  async function handleSave(data: BaseRatesFormData) {
    if (!property?.id) return

    try {
      setSaving(true)
      const updated = await propertiesService.updateProperty(property.id, {
        name: property.name,
        timezone: property.timezone,
        infant_max_age: property.infant_max_age ?? null,
        child_max_age: property.child_max_age ?? null,
        child_factor: data.child_factor ?? null,
        base_one_adult: data.base_one_adult ?? null,
        base_two_adults: data.base_two_adults ?? null,
        additional_adult: data.additional_adult ?? null,
        child_price: data.child_price ?? null,
      })
      setProperty(updated)
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
          {t('menu.settings.rates.base')}
        </Heading>
        <SkeletonFields rows={5} />
      </VStack>
    )
  }

  if (!property) {
    return (
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="lg">
          {t('menu.settings.rates.base')}
        </Heading>
        <Box>{t('common.status.no_data')}</Box>
      </VStack>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="lg">
          {t('menu.settings.rates.base')}
        </Heading>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <FormField
            label={t('common.pricing.child_factor')}
            name="child_factor"
            errors={errors}
          >
            <CurrencyInput control={control} name="child_factor" />
          </FormField>

          <FormField
            label={t('common.pricing.child_price')}
            name="child_price"
            errors={errors}
          >
            <CurrencyInput control={control} name="child_price" />
          </FormField>

          <FormField
            label={t('common.pricing.base_one_adult')}
            name="base_one_adult"
            errors={errors}
          >
            <CurrencyInput control={control} name="base_one_adult" />
          </FormField>

          <FormField
            label={t('common.pricing.base_two_adults')}
            name="base_two_adults"
            errors={errors}
          >
            <CurrencyInput control={control} name="base_two_adults" />
          </FormField>

          <GridItem colSpan={{ base: 2, md: 1 }}>
            <FormField
              label={t('common.pricing.additional_adult')}
              name="additional_adult"
              errors={errors}
            >
              <CurrencyInput control={control} name="additional_adult" />
            </FormField>
          </GridItem>
        </Grid>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={saving}
          alignSelf="flex-start"
        >
          {t('common.actions.save')}
        </Button>
      </VStack>
    </form>
  )
}
