import { getCollection } from 'astro:content';

const fullDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export function formatDate(date: Date): string {
  return fullDate.format(date);
}

const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** e.g. "Jul 6", for lists already grouped by year. */
export function formatMonthDay(date: Date): string {
  return monthDay.format(date);
}

/** Published posts, newest first. Drafts show up in `astro dev` only. */
export async function getPosts() {
  const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
