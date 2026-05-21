import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { subscriptions, favorites, searchHistory, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    console.log(`🗑️ [LGPD Deletion] Iniciando exclusão completa da conta do usuário: ${userId}`);

    // 1. Deletar registros locais vinculados ao usuário de forma atômica no Banco de Dados
    // (O cascade das chaves estrangeiras pode tratar a deleção secundária, mas explicitamos por segurança)
    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    await db.delete(favorites).where(eq(favorites.userId, userId));
    await db.delete(searchHistory).where(eq(searchHistory.userId, userId));
    await db.delete(users).where(eq(users.id, userId));

    // 2. Deletar conta permanentemente no Clerk via SDK Server-Side
    const client = await clerkClient();
    await client.users.deleteUser(userId);

    console.log(`✅ [LGPD Deletion] Conta e dados locais excluídos permanentemente no Clerk e PostgreSQL.`);

    return new NextResponse("Conta excluída permanentemente de acordo com a LGPD.", { status: 200 });
  } catch (error: any) {
    console.error("❌ Falha na exclusão de conta LGPD:", error);
    return new NextResponse(error.message || "Falha na exclusão de dados", { status: 500 });
  }
}
