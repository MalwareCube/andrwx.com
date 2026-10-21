import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ImageMetadata } from 'astro';
import satori, { type SatoriOptions } from 'satori';
import sharp from 'sharp';

// Social preview cards (og:image), rendered at build time. 1200x630 is what link previews expect.
const WIDTH = 1200;
const HEIGHT = 630;
const BANNER_WIDTH = 480;

// Satori can't read woff2, so the cards use the static (woff) Newsreader build. Resolved from the
// project root because this module gets bundled elsewhere at build time.
const fontFile = (weight: number) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/newsreader/files/newsreader-latin-${weight}-normal.woff`));
let fonts: Promise<SatoriOptions['fonts']> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all([fontFile(400), fontFile(600)]).then(([regular, semibold]) => [
    { name: 'Newsreader', data: regular, weight: 400 as const },
    { name: 'Newsreader', data: semibold, weight: 600 as const },
  ]));

const ink = '#1a1a1a';
const muted = '#555';

interface Card {
  title: string;
  description?: string;
  banner?: ImageMetadata;
}

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string | false | undefined)[]): Node => ({
  type,
  props: { style, children: children.filter(Boolean) },
});

/** Banner cropped to the card's right-hand panel, as a data URI satori can embed. */
async function bannerSrc(banner: ImageMetadata) {
  // `fsPath` is set by Astro on imported images but left out of the ImageMetadata type.
  const { fsPath } = banner as ImageMetadata & { fsPath: string };
  const jpeg = await sharp(fsPath).resize(BANNER_WIDTH, HEIGHT, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
}

export async function renderCard({ title, description, banner }: Card): Promise<Buffer> {
  const text = h(
    'div',
    { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: 24, padding: '64px 72px' },
    h('div', { fontSize: banner ? 56 : 68, fontWeight: 600, lineHeight: 1.15, color: ink, lineClamp: 3 }, title),
    description && h('div', { fontSize: 30, lineHeight: 1.4, color: muted, lineClamp: 3 }, description),
  );

  const card = h(
    'div',
    { display: 'flex', width: '100%', height: '100%', background: '#fff', fontFamily: 'Newsreader' },
    text,
    banner && {
      type: 'img',
      props: { src: await bannerSrc(banner), width: BANNER_WIDTH, height: HEIGHT, style: { objectFit: 'cover' } },
    },
  );

  const svg = await satori(card, { width: WIDTH, height: HEIGHT, fonts: await loadFonts() });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
