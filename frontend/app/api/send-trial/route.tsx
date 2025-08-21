import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import TrialEmail from "@/emails/trial-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { institutionEmail, fullName, institutionName, position, institutionPhone } = body;

    // Appel Resend
    const data = await resend.emails.send({
      from: "Qwish <onboarding@resend.dev>", // garde ce sender en local
      to: institutionEmail, // destinataire = email du formulaire
      subject: "Bienvenue sur Qwish - Votre essai gratuit",
      react: TrialEmail({ email: institutionEmail }), // ton template
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erreur envoi email :", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
