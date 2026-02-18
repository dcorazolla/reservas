import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  VStack,
  useDisclosure,
  Heading,
  Text,
  useToast,
  Container,
  Spinner,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { useAuth } from '@contexts/AuthContext'
import PageShell from '@components/PageShell/PageShell'
import BlocksModal from '@components/Blocks/BlocksModal'
import BlocksList from '@components/Blocks/BlocksList'
import Message from '@components/Shared/Message/Message'
import * as blocksService from '@services/blocks'
import * as roomsService from '@services/rooms'
import type { RoomBlock, RoomBlockInput } from '@models/blocks'
import type { Room } from '@models/rooms'

/**
 * BlocksPage - Room Blocks Management
 *
 * Displays a CRUD interface for managing room blocks (maintenance, cleaning, private, custom).
 * Supports filtering, sorting, and recurrence patterns.
 */
export const BlocksPage: React.FC = () => {
  const { user } = useAuth()
  const propertyId = user?.property_id
  const toast = useToast()

  // State
  const [blocks, setBlocks] = useState<RoomBlock[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBlock, setSelectedBlock] = useState<RoomBlock | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'duration'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    title: string
    description?: string
  } | null>(null)

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Load blocks and rooms
  useEffect(() => {
    if (!propertyId) return

    const loadData = async () => {
      try {
        setIsLoading(true)

        // Load rooms
        const roomsData = await roomsService.listRooms(propertyId)
        setRooms(roomsData.data || [])

        // Load blocks
        const blocksData = await blocksService.listBlocks(propertyId)
        setBlocks(blocksData.data || [])
      } catch (error) {
        console.error('Failed to load data:', error)
        setMessage({
          type: 'error',
          title: 'Erro ao carregar bloqueios',
          description:
            error instanceof Error ? error.message : 'Tente novamente mais tarde',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [propertyId])

  // Create new block
  const handleCreate = () => {
    setSelectedBlock(null)
    onOpen()
  }

  // Edit existing block
  const handleEdit = (block: RoomBlock) => {
    setSelectedBlock(block)
    onOpen()
  }

  // Delete block
  const handleDelete = async (block: RoomBlock) => {
    if (
      !confirm(
        `Tem certeza que deseja deletar o bloqueio de ${block.start_date} a ${block.end_date}?`
      )
    ) {
      return
    }

    try {
      setIsSubmitting(true)
      await blocksService.deleteBlock(propertyId!, block.id)

      setBlocks(blocks.filter((b) => b.id !== block.id))
      setMessage({
        type: 'success',
        title: 'Bloqueio deletado com sucesso',
      })
    } catch (error) {
      console.error('Failed to delete block:', error)
      setMessage({
        type: 'error',
        title: 'Erro ao deletar bloqueio',
        description:
          error instanceof Error ? error.message : 'Tente novamente mais tarde',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit (create or update)
  const handleSubmit = async (data: RoomBlockInput) => {
    if (!propertyId) return

    try {
      setIsSubmitting(true)

      if (selectedBlock) {
        // Update
        const updated = await blocksService.updateBlock(propertyId, selectedBlock.id, data)
        setBlocks(blocks.map((b) => (b.id === updated.id ? updated : b)))
        setMessage({
          type: 'success',
          title: 'Bloqueio atualizado com sucesso',
        })
      } else {
        // Create
        const created = await blocksService.createBlock(propertyId, data)
        setBlocks([...blocks, created])
        setMessage({
          type: 'success',
          title: 'Bloqueio criado com sucesso',
        })
      }
    } catch (error) {
      console.error('Failed to submit block:', error)
      setMessage({
        type: 'error',
        title: selectedBlock ? 'Erro ao atualizar bloqueio' : 'Erro ao criar bloqueio',
        description:
          error instanceof Error ? error.message : 'Tente novamente mais tarde',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle sort change
  const handleSortChange = (newSortBy: string, newDirection: 'asc' | 'desc') => {
    setSortBy(newSortBy as 'date' | 'type' | 'duration')
    setSortDirection(newDirection)
  }

  return (
    <PageShell>
      <Container maxW="container.xl" py={8}>
        <VStack align="stretch" spacing={6}>
          {/* Header */}
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" spacing={1}>
              <Heading as="h1" size="lg">
                🚫 Bloqueios de Quartos
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Gerencie manutenções, limpezas e bloqueios personalizados de quartos
              </Text>
            </VStack>
            <Button
              colorScheme="blue"
              leftIcon={<FiPlus />}
              onClick={handleCreate}
              size="lg"
            >
              Novo Bloqueio
            </Button>
          </HStack>

          {/* Message */}
          {message && (
            <Message
              title={message.title}
              description={message.description}
              type={message.type}
              onClose={() => setMessage(null)}
            />
          )}

          {/* Content */}
          <Box bg="white" borderRadius="lg" shadow="sm" p={6}>
            {isLoading ? (
              <VStack justify="center" align="center" py={10}>
                <Spinner size="lg" color="blue.500" />
                <Text color="gray.500">Carregando bloqueios...</Text>
              </VStack>
            ) : (
              <BlocksList
                blocks={blocks}
                isLoading={false}
                onEdit={handleEdit}
                onDelete={handleDelete}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
              />
            )}
          </Box>

          {/* Statistics */}
          {blocks.length > 0 && (
            <HStack spacing={4} justify="flex-start">
              <Box>
                <Text fontSize="sm" color="gray.500">
                  Total de bloqueios:
                </Text>
                <Text fontSize="lg" fontWeight="600">
                  {blocks.length}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">
                  Recorrentes:
                </Text>
                <Text fontSize="lg" fontWeight="600">
                  {blocks.filter((b) => b.recurrence !== 'none').length}
                </Text>
              </Box>
            </HStack>
          )}
        </VStack>
      </Container>

      {/* Modal */}
      <BlocksModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        block={selectedBlock}
        rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
        isLoading={isSubmitting}
      />
    </PageShell>
  )
}

export default BlocksPage
