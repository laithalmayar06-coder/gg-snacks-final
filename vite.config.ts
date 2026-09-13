import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { siteContent } from './src/data/siteContent'

export default defineConfig({ plugins: [react(), tailwindcss(), {
  name: 'site-seo',
  transformIndexHtml(html) {
    const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    return {
      html: html.replace('__SITE_TITLE__', escape(siteContent.seo.defaultTitle.en)).replace('__SITE_DESCRIPTION__', escape(siteContent.seo.defaultDescription.en)),
      tags: [
        { tag: 'meta', attrs: { property: 'og:title', content: siteContent.seo.defaultTitle.en }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { property: 'og:description', content: siteContent.seo.defaultDescription.en }, injectTo: 'head' as const },
        ...(siteContent.seo.defaultSocialPreviewImage ? [{ tag: 'meta', attrs: { property: 'og:image', content: siteContent.seo.defaultSocialPreviewImage }, injectTo: 'head' as const }] : []),
      ],
    }
  },
}] })
