import AppRoutes from './AppRoutes'
import AppChakraProvider from '@design/ChakraProvider'

export default function App() {
  return (
    <AppChakraProvider>
      <AppRoutes />
    </AppChakraProvider>
  )
}
