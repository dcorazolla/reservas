import React from 'react'
import { Box, Heading, Text, Button } from '@chakra-ui/react'
import EditRoomCategoryModal from '@components/RoomCategories/EditRoomCategoryModal'
import ConfirmDeleteModal from '@components/Properties/ConfirmDeleteModal'
import DataList from '@components/Shared/List/DataList'
import SkeletonList from '@components/Shared/Skeleton/SkeletonList'
import * as roomCategoriesService from '@services/roomCategories'
import * as ratesService from '@services/roomCategoryRates'
import { useTranslation } from 'react-i18next'
import type { RoomCategory as ServiceRoomCategory, RoomCategoryPayload } from '@services/roomCategories'

export default function RoomCategoriesPage() {
  const { t } = useTranslation()
  const [items, setItems] = React.useState<ServiceRoomCategory[]>([])
  const [editing, setEditing] = React.useState<ServiceRoomCategory | null>(null)
  const [deleting, setDeleting] = React.useState<ServiceRoomCategory | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSave(updated: any) {
    try {
      const payload: RoomCategoryPayload = { name: updated.name, description: updated.description ?? null }

      if (!updated.id) {
        const created = await roomCategoriesService.createRoomCategory(payload)

        // handle rates if provided
        if (updated._rates) {
          try {
            await ratesService.createRate(created.id, {
              base_one_adult: Number(updated._rates.base_one_adult) || 0,
              base_two_adults: Number(updated._rates.base_two_adults) || 0,
              additional_adult: Number(updated._rates.additional_adult) || 0,
              child_price: Number(updated._rates.child_price) || 0,
            })
            // refresh created with rates if needed
          } catch (err) {
            console.error('Failed to create rates', err)
          }
        }

        setItems((s) => [created, ...s])
      } else {
        const saved = await roomCategoriesService.updateRoomCategory(updated.id, payload)

        // handle rates if provided
        if (updated._rates) {
          try {
            if (updated._rates.id) {
              await ratesService.updateRate(updated._rates.id, {
                base_one_adult: Number(updated._rates.base_one_adult) || 0,
                base_two_adults: Number(updated._rates.base_two_adults) || 0,
                additional_adult: Number(updated._rates.additional_adult) || 0,
                child_price: Number(updated._rates.child_price) || 0,
              })
            } else {
              await ratesService.createRate(saved.id, {
                base_one_adult: Number(updated._rates.base_one_adult) || 0,
                base_two_adults: Number(updated._rates.base_two_adults) || 0,
                additional_adult: Number(updated._rates.additional_adult) || 0,
                child_price: Number(updated._rates.child_price) || 0,
              })
            }
          } catch (err) {
            console.error('Failed to save rates', err)
          }
        }

        setItems((s) => s.map((it) => (it.id === saved.id ? saved : it)))
      }
    } catch (err: any) {
      console.error('Failed to save room category', err)
      setError(err?.message || 'Failed to save')
    }
  }

  async function handleDelete(id: string) {
    try {
      await roomCategoriesService.deleteRoomCategory(id)
      setItems((s) => s.filter((it) => it.id !== id))
    } catch (err: any) {
      console.error('Failed to delete room category', err)
      setError(err?.message || 'Failed to delete')
    }
  }

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    roomCategoriesService
      .listRoomCategories()
      .then((data) => {
        if (!mounted) return
        setItems(data)
      })
      .catch((err) => {
        console.error('Failed to load room categories', err)
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
        <Heading size="md">{t('roomCategories.page.title')}</Heading>
        <Button colorScheme="blue" size="sm" onClick={() => { setEditing(null); setIsModalOpen(true) }}>{t('roomCategories.form.new')}</Button>
      </Box>

      {loading ? (
        <SkeletonList rows={3} />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <DataList
          items={items}
          className="room-categories-list"
          renderItem={(c: ServiceRoomCategory) => (
            <div className="entity-row">
              <div>
                <Text as="div" fontWeight={600}>{c.name}</Text>
                <Text as="div" fontSize="sm" color="gray.600">{c.description}</Text>
              </div>
              <div>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(c); setIsModalOpen(true) }}>{t('common.actions.edit')}</Button>
                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => setDeleting(c)}>{t('common.actions.delete')}</Button>
              </div>
            </div>
          )}
        />
      )}

      <EditRoomCategoryModal isOpen={isModalOpen} category={editing} onClose={() => { setIsModalOpen(false); setEditing(null) }} onSave={handleSave} />
      <ConfirmDeleteModal isOpen={!!deleting} name={deleting?.name} onClose={() => setDeleting(null)} onConfirm={() => deleting && handleDelete(deleting.id)} />
    </Box>
  )
}
