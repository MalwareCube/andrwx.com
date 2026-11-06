import rss from '@astrojs/rss';
import { getPosts } from '../lib';

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: 'Andrew Bergin',
    description: 'Writing by Andrew Bergin.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/writing/${post.id}/`,
    })),
  });
}
