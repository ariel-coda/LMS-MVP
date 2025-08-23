import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { institutionEmail } = body;

    const htmlPath = path.join(process.cwd(), '..', 'Emails', 'emails', 'transactional.html');
    let html = await fs.readFile(htmlPath, 'utf8');

    // (Optionnel) injecter dynamiquement l'email si tu as un placeholder, ex: {{EMAIL}}
    if (institutionEmail) {
      html = html.replace(/{{\s*EMAIL\s*}}/g, institutionEmail);
    }

    const data = await resend.emails.send({
      from: 'Qwish <onboarding@resend.dev>',
      to: institutionEmail,
      subject: 'Bienvenue sur Qwish - Votre essai gratuit',
      html, // <-- on envoie le HTML compilé Maizzle
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erreur envoi email :', error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
