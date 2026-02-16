import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export default function DateTimeClock() {
  const [now, setNow] = React.useState<Date>(() => new Date())

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const d = now
  const day = pad(d.getDate())
  const month = pad(d.getMonth() + 1)
  const year = d.getFullYear()
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  const seconds = pad(d.getSeconds())

  const dateStr = `${day}/${month}/${year}`
  const timeStr = `${hours}:${minutes}:${seconds}`

  return (
    <Box mr={3} textAlign="right" aria-live="polite">
      <VStack spacing={0} align="end">
        <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
          {dateStr}
        </Text>
        <Text fontSize={{ base: 'sm', md: 'md' }} fontFamily="mono" fontWeight={600} color="gray.800">
          {timeStr}
        </Text>
      </VStack>
    </Box>
  )
}
