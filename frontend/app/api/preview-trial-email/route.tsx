import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';

export async function GET() {
  // ajuste ce chemin selon l'endroit où est le dossier qwish-emails
  const file = path.join(process.cwd(), '..', 'Emails', 'emails', 'transactional.html');
  const html = await fs.readFile(file, 'utf8');
  return new NextResponse(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
