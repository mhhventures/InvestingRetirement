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

// Fire Meta Pixel PageView + GTM page_view on SPA route changes.
// Initial load PageView is tracked in index.html; GTM page_view always pushes.
import { pushEvent, contentGroupFromPath } from '@/lib/gtm'

let lastPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''
// Emit initial page_view for GTM (GA4 needs per-SPA push; initial HTML only has Meta Pixel).
if (typeof window !== 'undefined') {
  pushEvent('page_view', {
    page_path: window.location.pathname + window.location.search,
    page_title: document.title,
    content_group: contentGroupFromPath(window.location.pathname),
    referrer: document.referrer || '',
  })
}
router.subscribe('onResolved', () => {
  const path = window.location.pathname + window.location.search
  if (path === lastPath) return
  lastPath = path
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
  if (fbq) fbq('track', 'PageView')
  pushEvent('page_view', {
    page_path: path,
    page_title: document.title,
    content_group: contentGroupFromPath(window.location.pathname),
    referrer: document.referrer || '',
  })
})

// Global outbound/affiliate click tracker.
//   - Clicks on `{partner}.investingandretirement.com` anchors fire
//     Meta Pixel `Lead` AND GA4 `generate_lead`.
//   - Clicks on any other external host fire `click_outbound`.
//   - Clicks on internal product-card review links fire `select_item` (if data-product set).
// Each anchor dedupes per element lifetime so wrapper+inner CTA don't double-fire.
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
      if (fired.has(anchor)) return

      let host = ''
      let path = ''
      try {
        const u = new URL(href, window.location.href)
        host = u.hostname
        path = u.pathname
      } catch {
        return
      }

      const placement = anchor.getAttribute('data-placement') || 'auto'
      const productSlug = anchor.getAttribute('data-product') || ''
      const productCategory = anchor.getAttribute('data-product-category') || ''
      const isInternal = host === window.location.hostname
      const isPartner =
        PARTNER_HOST.test(host) &&
        host.replace(/^www\./, '') !== 'investingandretirement.com'

      if (isPartner) {
        fired.add(anchor)
        const partner = host.split('.')[0]
        const offer = path.replace(/^\//, '')
        const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
        if (fbq) {
          fbq('track', 'Lead', {
            content_name: offer || partner,
            content_category: partner,
            content_ids: [offer || partner],
            placement,
          })
        }
        pushEvent('generate_lead', {
          partner,
          offer,
          placement,
          item_id: productSlug || offer || partner,
          item_category: productCategory,
          currency: 'USD',
        })
        return
      }

      if (!isInternal) {
        fired.add(anchor)
        pushEvent('click_outbound', {
          placement,
          link_url: href,
          link_host: host,
        })
        return
      }

      // Internal click into a product review page.
      if (productSlug && path.startsWith('/product/')) {
        fired.add(anchor)
        pushEvent('select_item', {
          item_id: productSlug,
          item_category: productCategory,
          placement,
          item_list_name: placement,
        })
      }
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