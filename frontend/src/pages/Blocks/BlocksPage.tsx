import React from 'react'
import { Box, Button, Heading } from '@chakra-ui/react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Message from '@components/Shared/Message/Message'
import EditBlockModal from '@components/Blocks/EditBlockModal'
import ConfirmDeleteModal from '@components/Properties/ConfirmDeleteModal'
import DataList from '@components/Shared/List/DataList'
import SkeletonList from '@components/Shared/Skeleton/SkeletonList'
import * as blocksService from '@services/blocks'
import * as roomsService from '@services/rooms'
import { useTranslation } from 'react-i18next'
import type { RoomBlock, RoomBlockPayload } from '@services/blocks'
import type { Room } from '@models/room'

function formatDate(date: string): string {
  if (!date) return ''
  try {
    // Se vier em ISO format, parse; senão, assume YYYY-MM-DD
    const dateObj = date.includes('T') ? parseISO(date) : parseISO(date + 'T00:00:00Z')
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return date
  }
}

export default function BlocksPage() {
  const { t } = useTranslation()
  const [items, setItems] = React.useState<(RoomBlock & { room?: Room })[]>([])
  const [rooms, setRooms] = React.useState<Room[]>([])
  const [editing, setEditing] = React.useState<RoomBlock | null>(null)
  const [deleting, setDeleting] = React.useState<RoomBlock | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave(updated: any) {
    try {
      setMessage(null)
      const payload: RoomBlockPayload = {
        room_id: updated.room_id,
        start_date: updated.start_date,
        end_date: updated.end_date,
        type: updated.type,
        reason: updated.reason ?? null,
        recurrence: updated.recurrence ?? 'none',
      }

      let savedBlock: RoomBlock
      if (!updated.id) {
        savedBlock = await blocksService.createBlock(payload)
        const room = rooms.find(r => r.id === savedBlock.room_id)
        setItems((s) => [{ ...savedBlock, room }, ...s])
      } else {
        savedBlock = await blocksService.updateBlock(updated.id, payload)
        const room = rooms.find(r => r.id === savedBlock.room_id)
        setItems((s) => s.map((it) => (it.id === savedBlock.id ? { ...savedBlock, room } : it)))
      }

      setMessage({ type: 'success', text: t('common.status.success') })
      setEditing(null)
      setIsModalOpen(false)
    } catch (err: any) {
      console.error('Failed to save block', err)
      setMessage({ type: 'error', text: err?.response?.data?.message || err?.message || t('common.status.error_saving') })
    }
  }

  async function handleDelete(id: string) {
    try {
      setMessage(null)
      await blocksService.deleteBlock(id)
      setItems((s) => s.filter((it) => it.id !== id))
      setDeleting(null)
      setMessage({ type: 'success', text: t('common.status.success') })
    } catch (err: any) {
      console.error('Failed to delete block', err)
      setMessage({ type: 'error', text: err?.response?.data?.message || err?.message || t('common.status.error_saving') })
    }
  }

  React.useEffect(() => {
    let mounted = true
    setLoading(true)

    Promise.all([blocksService.listBlocks(), roomsService.listRooms()])
      .then(([blocks, roomList]) => {
        if (!mounted) return
        setRooms(roomList)
        const itemsWithRooms = blocks.map(block => ({
          ...block,
          room: roomList.find(r => r.id === block.room_id),
        }))
        setItems(itemsWithRooms)
      })
      .catch((err) => {
        console.error('Failed to load data', err)
        if (mounted) setMessage({ type: 'error', text: err?.message || t('common.status.error_loading') })
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [t])

  const typeLabels = {
    maintenance: t('blocks.type.maintenance'),
    cleaning: t('blocks.type.cleaning'),
    private: t('blocks.type.private'),
    custom: t('blocks.type.custom'),
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h1" size="lg">{t('blocks.page.title')}</Heading>
        <Button colorScheme="blue" size="sm" onClick={() => { setEditing(null); setIsModalOpen(true) }}>
          {t('blocks.form.new')}
        </Button>
      </Box>

      {message && <Message type={message.type} message={message.text} onClose={() => setMessage(null)} autoClose={5000} />}

      {loading ? (
        <SkeletonList rows={3} />
      ) : (
        <DataList
          items={items}
          className="blocks-list"
          renderItem={(block: RoomBlock & { room?: Room }) => (
            <div className="entity-row">
              <div>
                <Box fontWeight={600}>#{block.room?.number} - {block.room?.name} · {formatDate(block.start_date)} a {formatDate(block.end_date)}</Box>
                <Box fontSize="sm" color="gray.600">{typeLabels[block.type as keyof typeof typeLabels]} {block.reason ? `· ${block.reason}` : ''}</Box>
              </div>
              <div>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(block); setIsModalOpen(true) }}>{t('common.actions.edit')}</Button>
                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => setDeleting(block)}>{t('common.actions.delete')}</Button>
              </div>
            </div>
          )}
        />
      )}

      <EditBlockModal isOpen={isModalOpen} block={editing} onClose={() => { setIsModalOpen(false); setEditing(null) }} onSave={handleSave} rooms={rooms} />
      <ConfirmDeleteModal
        isOpen={!!deleting}
        name={deleting ? `${deleting.room?.number} - ${formatDate(deleting.start_date)} a ${formatDate(deleting.end_date)}` : ''}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && handleDelete(deleting.id)}
      />
    </Box>
  )
}
