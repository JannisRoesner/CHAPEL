// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    'nuxt-auth-utils',
    '@vite-pwa/nuxt'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: 'CHAPEL',
      meta: [
        { name: 'description', content: 'Church Hymn Audio Playlist Engine for Liturgy' },
        { name: 'theme-color', content: '#1e293b' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || 'dev-session-password-min-32-characters-long',
      cookie: {
        sameSite: 'lax',
        secure: false
      }
    }
  },

  routeRules: {
    '/login': { ssr: false },
    '/playback/**': { ssr: false }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    experimental: {
      websocket: true
    }
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['node']
      }
    },
    nodeTsConfig: {
      compilerOptions: {
        types: ['node']
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'CHAPEL',
      short_name: 'CHAPEL',
      description: 'Church Hymn Audio Playlist Engine for Liturgy',
      theme_color: '#1e293b',
      background_color: '#0f172a',
      display: 'standalone',
      lang: 'de',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      navigateFallback: undefined,
      runtimeCaching: [
        {
          urlPattern: /^\/api\/tracks\/\d+\/stream$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'chapel-audio-v2',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true
    }
  }
})
