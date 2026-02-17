import React from 'react'
import { Box, Heading, Text, Button } from '@chakra-ui/react'
import EditPartnerModal from '@components/Partners/EditPartnerModal'
import ConfirmDeleteModal from '@components/Properties/ConfirmDeleteModal'
import DataList from '@components/Shared/List/DataList'
import SkeletonList from '@components/Shared/Skeleton/SkeletonList'
import * as partnersService from '@services/partners'
import { useTranslation } from 'react-i18next'
import type { Partner as ServicePartner, PartnerPayload } from '@services/partners'

export default function PartnersPage() {
  const { t } = useTranslation()
  const [items, setItems] = React.useState<ServicePartner[]>([])
  const [editing, setEditing] = React.useState<ServicePartner | null>(null)
  const [deleting, setDeleting] = React.useState<ServicePartner | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSave(updated: ServicePartner) {
    try {
      if (!updated.id) {
        // create
        const payload: PartnerPayload = {
          name: updated.name,
          email: updated.email ?? null,
          phone: updated.phone ?? null,
          tax_id: updated.tax_id ?? null,
          address: updated.address ?? null,
          notes: updated.notes ?? null,
          billing_rule: updated.billing_rule ?? null,
          partner_discount_percent: updated.partner_discount_percent ?? null,
        }
        const created = await partnersService.createPartner(payload)
        setItems((s) => [created, ...s])
      } else {
        // update
        const payload: PartnerPayload = {
          name: updated.name,
          email: updated.email ?? null,
          phone: updated.phone ?? null,
          tax_id: updated.tax_id ?? null,
          address: updated.address ?? null,
          notes: updated.notes ?? null,
          billing_rule: updated.billing_rule ?? null,
          partner_discount_percent: updated.partner_discount_percent ?? null,
        }
        const saved = await partnersService.updatePartner(updated.id, payload)
        setItems((s) => s.map((it) => (it.id === saved.id ? saved : it)))
      }
    } catch (err: any) {
      console.error('Failed to save partner', err)
      setError(err?.message || 'Failed to save')
    }
  }

  async function handleDelete(id: string) {
    try {
      await partnersService.deletePartner(id)
      setItems((s) => s.filter((it) => it.id !== id))
      setDeleting(null)
    } catch (err: any) {
      console.error('Failed to delete partner', err)
      setError(err?.message || 'Failed to delete')
    }
  }

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    partnersService
      .listPartners()
      .then((data) => {
        if (!mounted) return
        setItems(data)
      })
      .catch((err) => {
        console.error('Failed to load partners', err)
        if (mounted) setError(err?.message || 'Failed to load')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">{t('partners.page.title')}</Heading>
        <Button colorScheme="blue" size="sm" onClick={() => { setEditing(null); setIsModalOpen(true) }}>{t('partners.form.new')}</Button>
      </Box>

      {loading ? (
        <SkeletonList rows={3} />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <DataList
          items={items}
          className="partners-list"
          renderItem={(p: ServicePartner) => (
            <div className="entity-row">
              <div>
                <Text as="div" fontWeight={600}>{p.name}</Text>
                <Text as="div" fontSize="sm" color="gray.600">{p.email} {p.phone && `- ${p.phone}`}</Text>
              </div>
              <div>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(p); setIsModalOpen(true) }}>{t('common.actions.edit')}</Button>
                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => setDeleting(p)}>{t('common.actions.delete')}</Button>
              </div>
            </div>
          )}
        />
      )}

      <EditPartnerModal isOpen={isModalOpen} partner={editing} onClose={() => { setIsModalOpen(false); setEditing(null) }} onSave={handleSave} />
      <ConfirmDeleteModal isOpen={!!deleting} name={deleting?.name} onClose={() => setDeleting(null)} onConfirm={() => deleting && handleDelete(deleting.id)} />
    </Box>
  )
}
