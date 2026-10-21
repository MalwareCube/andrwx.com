import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writing = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/writing' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      description: z.string().optional(),
      draft: z.boolean().default(false),
      // Optional banner shown above the post and used as the social preview image,
      // e.g. `banner: ./banner.webp`. 1200x630 suits link previews best.
      banner: image().optional(),
      bannerAlt: z.string().optional(),
    }),
});

export const collections = { writing };
