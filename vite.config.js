import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function googleAnalytics() {
  const id = process.env.GA_ID
  return {
    name: 'google-analytics',
    transformIndexHtml() {
      if (!id) return []
      return [
        {
          tag: 'script',
          attrs: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${id}` },
          injectTo: 'head',
        },
        {
          tag: 'script',
          injectTo: 'head',
          children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');`,
        },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), googleAnalytics()],
})
