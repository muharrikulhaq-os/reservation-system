'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib'

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
