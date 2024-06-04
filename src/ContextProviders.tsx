import { QueryClient, QueryClientProvider } from "react-query"
import type { ReactNode } from "react"

const queryClient = new QueryClient()

interface Props {
  children: ReactNode
}

const ContextProviders = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default ContextProviders
