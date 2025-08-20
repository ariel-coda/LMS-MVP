import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email } = body;

    // 1. Mail pour l'utilisateur
    await resend.emails.send({
      from: "TonApp <onboarding@tondomaine.com>", // ⚠️ besoin d’un domaine validé
      to: email,
      subject: "Bienvenue dans votre essai gratuit 🎉",
      html: `<p>Bonjour ${fullName},</p><p>Merci d'avoir demandé un essai gratuit. Nous reviendrons vite vers vous !</p>`,
    });

    // 2. Mail pour toi (notification)
    await resend.emails.send({
      from: "TonApp <onboarding@tondomaine.com>",
      to: "tonemail@exemple.com",
      subject: "Nouvelle demande d'essai gratuit",
      html: `<p>${fullName} (${email}) a demandé un essai gratuit.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
