import { StrictMode, lazy, Suspense, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

const queryClient = new QueryClient()

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((m) => ({ default: m.Analytics })),
)
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((m) => ({ default: m.SpeedInsights })),
)

function DeferredAnalytics() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const idle =
      (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1))
    const id = idle(() => setReady(true))
    return () => {
      const cancel = (
        window as unknown as { cancelIdleCallback?: (id: number) => void }
      ).cancelIdleCallback
      if (typeof id === 'number' && cancel) cancel(id)
    }
  }, [])
  if (!ready) return null
  return (
    <Suspense fallback={null}>
      <Analytics />
      <SpeedInsights />
    </Suspense>
  )
}

// Remove prerendered SEO fallback (duplicate h1 / nav) once JS takes over.
document.getElementById('seo-fallback')?.remove()

// Fire Meta Pixel PageView on SPA route changes (initial load is tracked in index.html).
let lastPixelPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''
router.subscribe('onResolved', () => {
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
  if (!fbq) return
  const path = window.location.pathname + window.location.search
  if (path === lastPixelPath) return
  lastPixelPath = path
  fbq('track', 'PageView')
})

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
        <DeferredAnalytics />
      </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}