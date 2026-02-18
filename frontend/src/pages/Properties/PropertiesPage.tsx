import React from 'react'
import { Box, Heading, Button, Text } from '@chakra-ui/react'
import Message from '@components/Shared/Message/Message'
import EditPropertyModal from '@components/Properties/EditPropertyModal'
import ConfirmDeleteModal from '@components/Properties/ConfirmDeleteModal'
import DataList from '@components/Shared/List/DataList'
import SkeletonList from '@components/Shared/Skeleton/SkeletonList'
import * as propertiesService from '@services/properties'
import { useTranslation } from 'react-i18next'
import type { Property as ServiceProperty, PropertyPayload } from '@services/properties'

export default function PropertiesPage() {
  const { t } = useTranslation()
  const [items, setItems] = React.useState<ServiceProperty[]>([])
  const [editing, setEditing] = React.useState<ServiceProperty | null>(null)
  const [deleting, setDeleting] = React.useState<ServiceProperty | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave(updated: ServiceProperty) {
    try {
      setMessage(null)
      if (!updated.id) {
        // create
        const payload: PropertyPayload = {
          name: updated.name,
          timezone: updated.timezone,
          infant_max_age: updated.infant_max_age ?? null,
          child_max_age: updated.child_max_age ?? null,
          child_factor: updated.child_factor ?? null,
          base_one_adult: updated.base_one_adult ?? null,
          base_two_adults: updated.base_two_adults ?? null,
          additional_adult: updated.additional_adult ?? null,
          child_price: updated.child_price ?? null,
        }
        const created = await propertiesService.createProperty(payload)
        setItems((s) => [created, ...s])
      } else {
        // update
        const payload: PropertyPayload = {
          name: updated.name,
          timezone: updated.timezone,
          infant_max_age: updated.infant_max_age ?? null,
          child_max_age: updated.child_max_age ?? null,
          child_factor: updated.child_factor ?? null,
          base_one_adult: updated.base_one_adult ?? null,
          base_two_adults: updated.base_two_adults ?? null,
          additional_adult: updated.additional_adult ?? null,
          child_price: updated.child_price ?? null,
        }
        const saved = await propertiesService.updateProperty(updated.id, payload)
        setItems((s) => s.map((it) => (it.id === saved.id ? saved : it)))
      }
      setMessage({ type: 'success', text: t('common.status.success') })
    } catch (err: any) {
      console.error('Failed to save property', err)
      setMessage({ type: 'error', text: err?.message || t('common.status.error_saving') })
    }
  }

  async function handleDelete(id: string) {
    try {
      setMessage(null)
      await propertiesService.deleteProperty(id)
      setItems((s) => s.filter((it) => it.id !== id))
      setDeleting(null)
      setMessage({ type: 'success', text: t('common.status.success') })
    } catch (err: any) {
      console.error('Failed to delete property', err)
      setMessage({ type: 'error', text: err?.message || t('common.status.error_saving') })
    }
  }

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    propertiesService
      .listProperties()
      .then((data) => {
        if (!mounted) return
        setItems(data)
      })
      .catch((err) => {
        console.error('Failed to load properties', err)
        if (mounted) setMessage({ type: 'error', text: err?.message || t('common.status.error_loading') })
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [t])

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">{t('properties.page.title')}</Heading>
        <Button colorScheme="blue" size="sm" onClick={() => { setEditing(null); setIsModalOpen(true) }}>{t('properties.form.new')}</Button>
      </Box>

      {message && <Message type={message.type} message={message.text} onClose={() => setMessage(null)} autoClose={30000} />}

      {loading ? (
        <SkeletonList rows={4} />
      ) : (
        <DataList
          items={items}
          className="properties-list"
          renderItem={(p: ServiceProperty) => (
            <div className="entity-row">
              <div>
                <Box fontWeight={600}>{p.name}</Box>
                <Box fontSize="sm" color="gray.600">{p.timezone}</Box>
              </div>
              <div>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(p); setIsModalOpen(true) }}>{t('common.actions.edit')}</Button>
                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => setDeleting(p)}>{t('common.actions.delete')}</Button>
              </div>
            </div>
          )}
        />
      )}

      <EditPropertyModal isOpen={isModalOpen} property={editing} onClose={() => { setIsModalOpen(false); setEditing(null) }} onSave={handleSave} />
      <ConfirmDeleteModal isOpen={!!deleting} name={deleting?.name} onClose={() => setDeleting(null)} onConfirm={() => deleting && handleDelete(deleting.id)} />
    </Box>
  )
}
