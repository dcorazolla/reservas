import React from 'react'
import { Box, Heading, Text, Button, VStack, HStack, Skeleton } from '@chakra-ui/react'
import './rooms.css'
import EditRoomModal from '@components/Rooms/EditRoomModal'
import ConfirmDeleteModal from '@components/Properties/ConfirmDeleteModal'
import DataList from '@components/Shared/List/DataList'
import * as roomsService from '@services/rooms'
import { useTranslation } from 'react-i18next'
import type { Room as ServiceRoom, RoomPayload } from '@services/rooms'

export default function RoomsPage() {
  const { t } = useTranslation()
  const [items, setItems] = React.useState<ServiceRoom[]>([])
  const [editing, setEditing] = React.useState<ServiceRoom | null>(null)
  const [deleting, setDeleting] = React.useState<ServiceRoom | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSave(updated: ServiceRoom) {
    try {
      const payload: RoomPayload = {
        name: updated.name,
        number: updated.number ?? null,
        room_category_id: updated.room_category_id ?? null,
      }

      if (!updated.id) {
        const created = await roomsService.createRoom(payload)
        setItems((s) => [created, ...s])
      } else {
        const saved = await roomsService.updateRoom(updated.id, payload)
        setItems((s) => s.map((it) => (it.id === saved.id ? saved : it)))
      }
    } catch (err: any) {
      console.error('Failed to save room', err)
      setError(t('rooms.errors.save') || err?.message || 'Failed to save')
    }
  }

  async function handleDelete(id: string) {
    try {
      await roomsService.deleteRoom(id)
      setItems((s) => s.filter((it) => it.id !== id))
    } catch (err: any) {
      console.error('Failed to delete room', err)
      setError(err?.message || 'Failed to delete')
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
        if (mounted) setError(t('rooms.errors.load') || err?.message || 'Failed to load')
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
        <Heading size="md">{t('rooms.page.title')}</Heading>
        <Button colorScheme="blue" size="sm" onClick={() => { setEditing(null); setIsModalOpen(true) }}>{t('rooms.form.new')}</Button>
      </Box>

      {loading ? (
        <VStack spacing={3} align="stretch">
          {[1, 2, 3].map((i) => (
            <HStack key={i} justify="space-between">
              <Skeleton height="40px" width="60%" />
              <Skeleton height="40px" width="20%" />
            </HStack>
          ))}
        </VStack>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <DataList
          items={items}
          className="rooms-list"
          renderItem={(r: ServiceRoom) => (
            <div className="room-row">
              <div>
                <Text as="div" fontWeight={600}>{r.name}</Text>
                <Text as="div" fontSize="sm" color="gray.600">{r.number} {r.beds ? `· ${r.beds} bed(s)` : ''} {r.capacity ? `· ${r.capacity} pax` : ''}</Text>
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
