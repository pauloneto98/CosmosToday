"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { users, favorites, subscriptions, searchHistory } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

async function verifyAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Não autorizado");
  }

  const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!dbUser || dbUser.role !== "admin") {
    throw new Error("Acesso restrito apenas a administradores.");
  }
  return userId;
}

export async function getAdminUsers() {
  await verifyAdmin();
  try {
    return await db.select().from(users).orderBy(users.createdAt);
  } catch (error) {
    console.error("❌ Erro ao listar usuários para o admin:", error);
    return [];
  }
}

export async function updateAdminUserRole(targetUserId: string, newRole: "user" | "admin") {
  await verifyAdmin();
  try {
    await db.update(users).set({ role: newRole }).where(eq(users.id, targetUserId));
    console.log(`🛡️ [Admin Action] Papel do usuário ${targetUserId} alterado para: ${newRole}`);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erro ao atualizar papel de usuário:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAdminUserAccount(targetUserId: string) {
  await verifyAdmin();
  try {
    console.log(`🛡️ [Admin Action] Removendo permanentemente usuário: ${targetUserId}`);

    // Excluir do banco
    await db.delete(subscriptions).where(eq(subscriptions.userId, targetUserId));
    await db.delete(favorites).where(eq(favorites.userId, targetUserId));
    await db.delete(searchHistory).where(eq(searchHistory.userId, targetUserId));
    await db.delete(users).where(eq(users.id, targetUserId));

    // Excluir do Clerk
    const client = await clerkClient();
    await client.users.deleteUser(targetUserId);

    return { success: true };
  } catch (error: any) {
    console.error("❌ Erro ao excluir usuário pelo painel admin:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminMetrics() {
  await verifyAdmin();
  try {
    const userCountRes = await db.select({ count: sql<number>`count(*)` }).from(users);
    const favCountRes = await db.select({ count: sql<number>`count(*)` }).from(favorites);
    const subCountRes = await db.select({ count: sql<number>`count(*)` }).from(subscriptions);

    const activeSubs = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    return {
      totalUsers: Number(userCountRes[0]?.count || 0),
      totalFavorites: Number(favCountRes[0]?.count || 0),
      totalSubscriptions: Number(subCountRes[0]?.count || 0),
      activeSubscriptions: Number(activeSubs[0]?.count || 0),
    };
  } catch (error) {
    console.error("❌ Erro ao buscar métricas de administração:", error);
    return {
      totalUsers: 0,
      totalFavorites: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
    };
  }
}

export async function becomeAdmin() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Não autorizado" };
  }
  try {
    await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));
    console.log(`🛡️ [Admin Action] Usuário ${userId} promoveu a si mesmo a Admin!`);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erro ao auto-promover a admin:", error);
    return { success: false, error: error.message };
  }
}
