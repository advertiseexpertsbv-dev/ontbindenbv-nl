import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { meldWeergave } from './lib/bezoek'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    trailingSlash: 'always',
  })

  // Bezoekersmeting: navigaties binnen de site melden. Het eerste (hydratie-)
  // event heeft geen fromLocation; die lading telt de server al.
  if (typeof window !== 'undefined') {
    router.subscribe('onResolved', (ev) => {
      if (ev.fromLocation && ev.pathChanged) meldWeergave(ev.toLocation.pathname)
    })
  }

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
