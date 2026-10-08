import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import fs from 'node:fs'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  base: '/keepgoals/',
  plugins: [
    basicSsl(),
    react(),
    {
      name: 'serve-portal-and-speakling',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // 0. Auto-przekierowanie 127.0.0.1 -> localhost (Firebase Auth nie dopuszcza 127.0.0.1)
          const host = req.headers.host || ''
          if (host.startsWith('127.0.0.1')) {
            const proto = (req.socket as any)?.encrypted ? 'https' : 'http'
            const targetHost = host.replace('127.0.0.1', 'localhost')
            res.writeHead(302, { Location: `${proto}://${targetHost}${req.url || ''}` })
            return res.end()
          }

          const rawUrl = req.url || ''
          const url = rawUrl.split('?')[0]

          // 1. Strona główna portalu (Hub przemokoduje.com)
          if (url === '/' || url === '/index.html') {
            const portalPath = path.resolve(__dirname, '../portal/index.html')
            if (fs.existsSync(portalPath)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8')
              return res.end(fs.readFileSync(portalPath, 'utf-8'))
            }
          }

          // 2. Przekierowanie /keepgoals -> /keepgoals/
          if (url === '/keepgoals') {
            res.writeHead(301, { Location: '/keepgoals/' })
            return res.end()
          }

          // 3. Strona aplikacji Speakling
          if (url === '/speakling' || url === '/speakling/' || url === '/speakling.html') {
            const speaklingHtml = path.resolve(__dirname, '../../AI-english_buddy/frontend/build/speakling.html')
            if (fs.existsSync(speaklingHtml)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8')
              return res.end(fs.readFileSync(speaklingHtml, 'utf-8'))
            }
          }

          // 4. Statyczne zasoby Speakling (/static/...)
          if (url.startsWith('/static/')) {
            const staticFile = path.resolve(__dirname, '../../AI-english_buddy/frontend/build', url.slice(1))
            if (fs.existsSync(staticFile) && fs.statSync(staticFile).isFile()) {
              if (url.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript')
              if (url.endsWith('.css')) res.setHeader('Content-Type', 'text/css')
              return res.end(fs.readFileSync(staticFile))
            }
          }

          next()
        })
      }
    }
  ],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api/v1': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('firebase')) return 'vendor-firebase'
            if (id.includes('lucide-react')) return 'vendor-icons'
            return 'vendor-libs'
          }
        }
      }
    }
  }
})
