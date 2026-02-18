import React from 'react'
import { Box, Heading, Button, Text } from '@chakra-ui/react'
import Message from '@components/Shared/Message/Message'
import EditRoomModal from '@components/Rooms/EditRoomModal'
import ConfirmDeleteModal from '@components/Properties/ConfirmDeleteModal'
import DataList from '@components/Shared/List/DataList'
import SkeletonList from '@components/Shared/Skeleton/SkeletonList'
import * as roomsService from '@services/rooms'
import * as roomRatesService from '@services/roomRates'
import { useTranslation } from 'react-i18next'
import type { Room as ServiceRoom, RoomPayload } from '@services/rooms'

export default function RoomsPage() {
  const { t } = useTranslation()
  const [items, setItems] = React.useState<ServiceRoom[]>([])
  const [editing, setEditing] = React.useState<ServiceRoom | null>(null)
  const [deleting, setDeleting] = React.useState<ServiceRoom | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave(updated: any) {
    try {
      setMessage(null)
      const payload: RoomPayload = {
        name: updated.name,
        number: updated.number ?? null,
        room_category_id: updated.room_category_id ?? null,
        beds: updated.beds,
        capacity: updated.capacity,
        active: updated.active,
        notes: updated.notes ?? null,
      }

      let savedRoom: ServiceRoom
      if (!updated.id) {
        savedRoom = await roomsService.createRoom(payload)
        setItems((s) => [savedRoom, ...s])
      } else {
        savedRoom = await roomsService.updateRoom(updated.id, payload)
        setItems((s) => s.map((it) => (it.id === savedRoom.id ? savedRoom : it)))
      }

      // handle room rates if provided
      if (updated._rates) {
        for (const rate of updated._rates) {
          try {
            const hasValue = rate.price_per_day != null && rate.price_per_day !== ''
            if (hasValue && rate.id) {
              // update existing rate
              await roomRatesService.updateRate(rate.id, {
                people_count: rate.people_count,
                price_per_day: rate.price_per_day,
              })
            } else if (hasValue && !rate.id) {
              // create new rate
              await roomRatesService.createRate(savedRoom.id, {
                people_count: rate.people_count,
                price_per_day: rate.price_per_day,
              })
            } else if (!hasValue && rate.id) {
              // field was cleared — remove from database
              await roomRatesService.deleteRate(rate.id)
            }
            // if no value and no id, nothing to do
          } catch (err) {
            console.error('Failed to save room rate', err)
          }
        }
      }
      setMessage({ type: 'success', text: t('common.status.success') })
    } catch (err: any) {
      console.error('Failed to save room', err)
      setMessage({ type: 'error', text: err?.message || t('common.status.error_saving') })
    }
  }

  async function handleDelete(id: string) {
    try {
      setMessage(null)
      await roomsService.deleteRoom(id)
      setItems((s) => s.filter((it) => it.id !== id))
      setDeleting(null)
      setMessage({ type: 'success', text: t('common.status.success') })
    } catch (err: any) {
      console.error('Failed to delete room', err)
      setMessage({ type: 'error', text: err?.message || t('common.status.error_saving') })
    }
  }

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    roomsService
      .listRooms()
      .then((data) => {
        if (!mounted) return
        setItems(data)
      })
      .catch((err) => {
        console.error('Failed to load rooms', err)
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
        <Heading size="md">{t('rooms.page.title')}</Heading>
        <Button colorScheme="blue" size="sm" onClick={() => { setEditing(null); setIsModalOpen(true) }}>{t('rooms.form.new')}</Button>
      </Box>

      {message && <Message type={message.type} message={message.text} onClose={() => setMessage(null)} autoClose={30000} />}

      {loading ? (
        <SkeletonList rows={3} />
      ) : (
        <DataList
          items={items}
          className="rooms-list"
          renderItem={(r: ServiceRoom) => (
            <div className="entity-row">
              <div>
                <Box fontWeight={600}>{r.name}</Box>
                <Box fontSize="sm" color="gray.600">{r.number} {r.beds ? `· ${r.beds} bed(s)` : ''} {r.capacity ? `· ${r.capacity} pax` : ''}</Box>
              </div>
              <div>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setIsModalOpen(true) }}>{t('common.actions.edit')}</Button>
                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => setDeleting(r)}>{t('common.actions.delete')}</Button>
              </div>
            </div>
          )}
        />
      )}

      <EditRoomModal isOpen={isModalOpen} room={editing} onClose={() => { setIsModalOpen(false); setEditing(null) }} onSave={handleSave} />
      <ConfirmDeleteModal isOpen={!!deleting} name={deleting?.name} onClose={() => setDeleting(null)} onConfirm={() => deleting && handleDelete(deleting.id)} />
    </Box>
  )
}
