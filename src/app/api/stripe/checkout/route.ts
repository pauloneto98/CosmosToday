import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db/client";
import { subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { planType } = await req.json();

    if (!planType || !["explorer", "family"].includes(planType)) {
      return new NextResponse("Plano inválido", { status: 400 });
    }

    // Configurar IDs de preços simulados para o ambiente de testes do Stripe
    const prices: Record<string, string> = {
      explorer: "price_1explorer_mock_123",
      family: "price_1family_mock_123",
    };

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Se a chave do Stripe for a padrão simulada, ativa o Mock Checkout Flow
    if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY.startsWith("sk_test_mock")) {
      console.log(`✨ [Stripe Mock] Criando checkout simulado para o plano: ${planType}`);
      
      // Sincroniza usuário simulado no DB local
      await db.insert(users)
        .values({
          id: userId,
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        })
        .onConflictDoNothing();

      // Sincroniza inscrição de teste diretamente no banco de dados local para simulação
      const existingSub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
      
      if (existingSub.length > 0) {
        await db.update(subscriptions)
          .set({
            planType: planType,
            status: "active",
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, userId));
      } else {
        await db.insert(subscriptions)
          .values({
            userId: userId,
            stripeCustomerId: "cus_mock_" + Math.random().toString(36).substring(7),
            stripeSubscriptionId: "sub_mock_" + Math.random().toString(36).substring(7),
            status: "active",
            planType: planType,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
      }

      // Retorna redirecionamento simulado de sucesso
      return NextResponse.json({ url: `${origin}/dashboard?checkout=success` });
    }

    // --- Fluxo de Produção Stripe Real ---
    // Buscar se o cliente já possui cadastro de cobrança
    const userSub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    let stripeCustomerId = userSub[0]?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
    }

    // Criar Sessão de Checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: prices[planType],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard?checkout=cancel`,
      metadata: {
        userId,
        planType,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("❌ Erro na criação de sessão de checkout Stripe:", error);
    return new NextResponse(error.message || "Erro interno", { status: 500 });
  }
}
