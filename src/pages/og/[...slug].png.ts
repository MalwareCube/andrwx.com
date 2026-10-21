import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts } from '../../lib';
import { renderCard } from '../../og';

// /og/default.png for pages without their own card, /og/writing/<post>.png for each post.
export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return [
    {
      params: { slug: 'default' },
      props: {
        title: 'Andrew Prince',
        description: 'Digital forensics, incident response, and security.',
      },
    },
    ...posts.map(({ id, data }) => ({
      params: { slug: `writing/${id}` },
      props: { title: data.title, description: data.description, banner: data.banner },
    })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderCard(props as Parameters<typeof renderCard>[0])), {
    headers: { 'Content-Type': 'image/png' },
  });
