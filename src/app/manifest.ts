import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Impulsa PR — Dashboard',
    short_name: 'Impulsa PR',
    description: 'Panel de automatización WhatsApp: leads, pipeline y conversaciones.',
    start_url: '/',
    display: 'standalone',
    background_color: '#064e3b',
    theme_color: '#064e3b',
    orientation: 'portrait',
    icons: [
      {
        src: '/logo-circle.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo-circle.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
