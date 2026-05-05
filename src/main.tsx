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

// Global affiliate-click tracker: any anchor pointing at `{partner}.investingandretirement.com`
// fires a Meta Pixel `Lead` event. Dedupes per anchor node per tick to avoid double-firing
// when both a card wrapper and inner CTA are tracked. Works across calculators, comparison
// modules, sidebar offers, state bank pages, and any future partner link.
if (typeof document !== 'undefined') {
  const PARTNER_HOST = /(^|\.)investingandretirement\.com$/i
  const fired = new WeakSet<Element>()
  document.addEventListener(
    'click',
    (ev) => {
      const target = ev.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      let host = ''
      try {
        host = new URL(href, window.location.href).hostname
      } catch {
        return
      }
      if (!PARTNER_HOST.test(host)) return
      // Skip the www/root host — only partner subdomains.
      if (host.replace(/^www\./, '') === 'investingandretirement.com') return
      if (fired.has(anchor)) return
      fired.add(anchor)
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
      if (!fbq) return
      const partner = host.split('.')[0]
      const offer = new URL(href, window.location.href).pathname.replace(/^\//, '')
      const placement = anchor.getAttribute('data-placement') || 'auto'
      fbq('track', 'Lead', {
        content_name: offer || partner,
        content_category: partner,
        content_ids: [offer || partner],
        placement,
        page_path: window.location.pathname,
      })
    },
    true,
  )
}

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