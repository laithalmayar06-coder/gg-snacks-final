import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { siteContent } from './src/data/siteContent'
import { siteOrigin, sitemapPaths } from './src/data/seo'

export default defineConfig({ build: { rollupOptions: { output: { manualChunks(id) {
  if (id.includes('/node_modules/@supabase/')) return 'supabase-vendor'
} } } }, plugins: [react(), tailwindcss(), {
  name: 'site-seo',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /dashboard/\nDisallow: /rate/\nSitemap: ${siteOrigin}/sitemap.xml\n` })
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths.map(path => `  <url><loc>${new URL(path, siteOrigin).href}</loc></url>`).join('\n')}\n</urlset>\n` })
  },
  transformIndexHtml(html) {
    const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    return {
      html: html.replace('__SITE_TITLE__', escape(siteContent.seo.defaultTitle.en)).replace('__SITE_DESCRIPTION__', escape(siteContent.seo.defaultDescription.en)),
      tags: [
        { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { property: 'og:locale', content: 'en_US' }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary' }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { name: 'twitter:title', content: siteContent.seo.defaultTitle.en }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { name: 'twitter:description', content: siteContent.seo.defaultDescription.en }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { property: 'og:title', content: siteContent.seo.defaultTitle.en }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { property: 'og:description', content: siteContent.seo.defaultDescription.en }, injectTo: 'head' as const },
        ...(siteContent.seo.defaultSocialPreviewImage ? [{ tag: 'meta', attrs: { property: 'og:image', content: siteContent.seo.defaultSocialPreviewImage }, injectTo: 'head' as const }] : []),
      ],
    }
  },
}] })
