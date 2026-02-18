import React, { useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  FormErrorMessage,
  HStack,
  Box,
  Text,
} from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BLOCK_TYPE_LABELS,
  BLOCK_RECURRENCE_LABELS,
  BlockType,
  BlockRecurrence,
  validateBlockInput,
} from '@models/blocks'
import type { RoomBlock, RoomBlockInput } from '@models/blocks'
import { z } from 'zod'

// Define validation schema
const blockSchema = z.object({
  room_id: z.string().min(1, 'Selecione um quarto'),
  start_date: z.string().min(1, 'Data inicial obrigatória'),
  end_date: z.string().min(1, 'Data final obrigatória'),
  type: z.enum(['maintenance', 'cleaning', 'private', 'custom'] as const),
  reason: z.string().optional().nullable(),
  recurrence: z
    .enum(['none', 'daily', 'weekly', 'monthly'] as const)
    .optional(),
})

type BlockFormInput = z.infer<typeof blockSchema>

interface BlocksModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RoomBlockInput) => Promise<void> | void
  block?: RoomBlock | null
  rooms: Array<{ id: string; name: string }>
  isLoading?: boolean
}

/**
 * Modal for creating or editing room blocks.
 * Includes form validation, date pickers, and type selection.
 *
 * @component
 * @example
 * <BlocksModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onSubmit={handleSubmit}
 *   rooms={rooms}
 * />
 */
export const BlocksModal: React.FC<BlocksModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  block,
  rooms,
  isLoading = false,
}) => {
  const isEditing = !!block
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<BlockFormInput>({
    resolver: zodResolver(blockSchema),
    defaultValues: {
      room_id: block?.room_id || '',
      start_date: block?.start_date || '',
      end_date: block?.end_date || '',
      type: block?.type || 'maintenance',
      reason: block?.reason || '',
      recurrence: block?.recurrence || 'none',
    },
  })

  const startDate = watch('start_date')
  const endDate = watch('end_date')

  // Validate date range
  const isDateRangeValid =
    !startDate || !endDate || startDate < endDate

  useEffect(() => {
    if (isOpen && block) {
      reset({
        room_id: block.room_id,
        start_date: block.start_date,
        end_date: block.end_date,
        type: block.type as any,
        reason: block.reason,
        recurrence: block.recurrence as any,
      })
    } else if (isOpen && !block) {
      reset({
        room_id: '',
        start_date: '',
        end_date: '',
        type: 'maintenance',
        reason: '',
        recurrence: 'none',
      })
    }
  }, [isOpen, block, reset])

  const handleFormSubmit = async (formData: BlockFormInput) => {
    // Validate input
    const validation = validateBlockInput(formData)
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors)
      return
    }

    try {
      await onSubmit(formData)
      reset()
      onClose()
    } catch (error) {
      console.error('Failed to submit block:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditing ? 'Editar Bloqueio' : 'Novo Bloqueio'}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            {/* Room Selection */}
            <Controller
              name="room_id"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={!!errors.room_id}>
                  <FormLabel fontWeight="600">Quarto</FormLabel>
                  <Select
                    {...field}
                    placeholder="Selecione um quarto"
                    disabled={isSubmitting || isLoading}
                  >
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.room_id?.message}</FormErrorMessage>
                </FormControl>
              )}
            />

            {/* Block Type */}
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <FormLabel fontWeight="600">Tipo de Bloqueio</FormLabel>
                  <Select {...field} disabled={isSubmitting || isLoading}>
                    {Object.entries(BLOCK_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            {/* Date Range */}
            <HStack width="100%" spacing={4}>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <FormControl isInvalid={!!errors.start_date} flex={1}>
                    <FormLabel fontWeight="600">Data Inicial</FormLabel>
                    <Input
                      {...field}
                      type="date"
                      disabled={isSubmitting || isLoading}
                    />
                    <FormErrorMessage>
                      {errors.start_date?.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
              />

              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <FormControl isInvalid={!!errors.end_date} flex={1}>
                    <FormLabel fontWeight="600">Data Final</FormLabel>
                    <Input
                      {...field}
                      type="date"
                      disabled={isSubmitting || isLoading}
                    />
                    <FormErrorMessage>
                      {errors.end_date?.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
              />
            </HStack>

            {/* Date Range Validation Message */}
            {startDate && endDate && !isDateRangeValid && (
              <Box
                p={2}
                bg="red.50"
                borderRadius="md"
                borderLeft="4px solid"
                borderColor="red.500"
              >
                <Text fontSize="sm" color="red.700">
                  Data final deve ser posterior à data inicial
                </Text>
              </Box>
            )}

            {/* Recurrence */}
            <Controller
              name="recurrence"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <FormLabel fontWeight="600">Recorrência</FormLabel>
                  <Select {...field} disabled={isSubmitting || isLoading}>
                    {Object.entries(BLOCK_RECURRENCE_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </Select>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Semanal: repete todo terça (se iniciar terça), etc.
                    <br />
                    Mensal: repete no mesmo dia de cada mês
                  </Text>
                </FormControl>
              )}
            />

            {/* Reason */}
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <FormLabel fontWeight="600">Motivo (opcional)</FormLabel>
                  <Textarea
                    {...field}
                    placeholder="Ex: Manutenção de tubulação, Limpeza profunda..."
                    rows={3}
                    disabled={isSubmitting || isLoading}
                  />
                </FormControl>
              )}
            />
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit(handleFormSubmit)}
              isLoading={isSubmitting || isLoading}
              disabled={!isDateRangeValid}
            >
              {isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default BlocksModal
