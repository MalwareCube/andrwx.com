// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

/** Open external links in posts in a new tab. */
const externalLinks = {
  name: 'external-links',
  element: {
    filter: ['a'],
    /** @param {import('hast').Element} node @param {import('satteri').HastVisitorContext} ctx */
    visit(node, ctx) {
      if (/^https?:\/\//.test(String(node.properties.href ?? ''))) {
        ctx.setProperty(node, 'target', '_blank');
        ctx.setProperty(node, 'rel', 'noopener noreferrer');
      }
    },
  },
};

export default defineConfig({
  site: 'https://andrwx.com',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-light' },
    processor: satteri({
      // ︎ keeps ↩ as a text glyph; iOS renders it as an emoji otherwise.
      features: { gfm: { footnotes: { label: 'Notes', backContent: '↩︎' } } },
      hastPlugins: [externalLinks],
    }),
  },
});
