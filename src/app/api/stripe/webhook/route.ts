import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db/client";
import { subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("Assinatura do webhook ausente", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    
    // Se não houver webhook secret configurado, ignora verificação de assinatura (apenas em testes locais)
    if (!webhookSecret && process.env.NODE_ENV === "development") {
      event = JSON.parse(body) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (error: any) {
    console.error(`❌ Falha na verificação de assinatura do Webhook: ${error.message}`);
    return new NextResponse(`Erro de Webhook: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    // 1. Evento: Checkout concluído
    if (event.type === "checkout.session.completed") {
      const subscription = (await stripe.subscriptions.retrieve(session.subscription as string)) as any;
      
      const userId = session.metadata?.userId;
      const planType = session.metadata?.planType || "explorer";

      if (!userId) {
        return new NextResponse("UserID ausente nos metadados do Stripe", { status: 400 });
      }

      // Garante que o usuário esteja inserido no banco local
      const customerEmail = session.customer_details?.email || "";
      const customerName = session.customer_details?.name || "";
      
      await db.insert(users)
        .values({
          id: userId,
          email: customerEmail,
          name: customerName,
        })
        .onConflictDoNothing();

      // Grava/Atualiza plano na tabela de assinaturas (Idempotente)
      const existingSub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
      
      if (existingSub.length > 0) {
        await db.update(subscriptions)
          .set({
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            planType: planType,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, userId));
      } else {
        await db.insert(subscriptions)
          .values({
            userId: userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            planType: planType,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });
      }
    }

    // 2. Evento: Pagamento recorrente efetuado com sucesso
    if (event.type === "invoice.payment_succeeded") {
      const subscription = (await stripe.subscriptions.retrieve(session.subscription as string)) as any;
      
      await db.update(subscriptions)
        .set({
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
    }

    // 3. Evento: Assinatura cancelada
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      await db.update(subscriptions)
        .set({
          status: "canceled",
          planType: "free",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
    }

    return new NextResponse("Webhook processado com sucesso", { status: 200 });
  } catch (error: any) {
    console.error("❌ Falha interna ao processar Webhook Stripe:", error);
    return new NextResponse("Erro interno no servidor do webhook", { status: 500 });
  }
}
