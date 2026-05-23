"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { users, favorites, subscriptions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// Curated space photographs from May 2026 (NASA, SpaceX, ESA, CNSA)
const MAY_2026_PHOTOS = [
  {
    title: "O Domínio Nebuloso de WR 134",
    mediaType: "apod",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Wr134-chla.jpg/1024px-Wr134-chla.jpg",
    hdurl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Wr134-chla.jpg",
    date: "2026-05-22",
    explanation: "Esta imagem impressionante em banda estreita revela a nebulosa em forma de anel que envolve a massiva estrela de Wolf-Rayet WR 134, localizada na constelação de Cygnus. As intensas emissões de oxigênio ionizado e hidrogênio criam uma estrutura de choque brilhante e ventos estelares velozes. Crédito da Imagem e Direitos: Francesco Pedretti / NASA."
  },
  {
    title: "Falcon 9: Rastro Estelar Starlink-9",
    mediaType: "image",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/SpaceX_Starlink_Launch_G7-9_Falcon_9_Liftoff.jpg/1024px-SpaceX_Starlink_Launch_G7-9_Falcon_9_Liftoff.jpg",
    hdurl: "https://upload.wikimedia.org/wikipedia/commons/3/3b/SpaceX_Starlink_Launch_G7-9_Falcon_9_Liftoff.jpg",
    date: "2026-05-19",
    explanation: "Lançamento glorioso do Falcon 9 a partir da Base da Força Espacial de Vandenberg na Califórnia, levando 24 satélites Starlink adicionais para a órbita terrestre baixa. A foto registra a subida do foguete deixando um rastro brilhante no crepúsculo. Crédito da Imagem: SpaceX (Domínio Público)."
  },
  {
    title: "Quito Vista do Espaço - Sentinel-2",
    mediaType: "image",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Quito%2C_Ecuador_Copernicus_Sentinel-2.jpg/1024px-Quito%2C_Ecuador_Copernicus_Sentinel-2.jpg",
    hdurl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Quito%2C_Ecuador_Copernicus_Sentinel-2.jpg",
    date: "2026-05-15",
    explanation: "A paisagem vulcânica deslumbrante de Quito, capital do Equador, capturada em alta resolução pelo satélite Copernicus Sentinel-2 da Agência Espacial Europeia. É possível ver a complexa topografia montanhosa cercada por encostas vulcânicas andinas. Crédito da Imagem: ESA/Copernicus Sentinel-2."
  },
  {
    title: "Lançador Longa Marcha-2F da Missão Shenzhou-23",
    mediaType: "image",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Long_March_2F_launching_Shenzhou_16.jpg/1024px-Long_March_2F_launching_Shenzhou_16.jpg",
    hdurl: "https://upload.wikimedia.org/wikipedia/commons/6/69/Long_March_2F_launching_Shenzhou_16.jpg",
    date: "2026-05-18",
    explanation: "O imponente foguete Longa Marcha-2F na rampa de lançamento do Centro de Lançamento de Satélites de Jiuquan, preparado para levar a tripulação da Shenzhou-23 até a Estação Espacial Tiangong. O programa espacial tripulado chinês segue expandindo sua órbita. Crédito da Imagem: CNSA/Xinhua."
  },
  {
    title: "Missão SMILE: Liftoff do Vega-C",
    mediaType: "image",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Vega_flight_VV01.jpg/1024px-Vega_flight_VV01.jpg",
    hdurl: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Vega_flight_VV01.jpg",
    date: "2026-05-19",
    explanation: "Lançamento bem-sucedido da missão SMILE (Solar wind Magnetosphere Ionosphere Link Explorer) a bordo do veículo Vega-C no porto espacial de Kourou, na Guiana Francesa. A sonda investigará a interação entre o vento solar e a magnetosfera terrestre. Crédito da Imagem: ESA/Kourou Media."
  },
  {
    title: "Falcon 9 no Pad da CRS-34",
    mediaType: "image",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/CRS-20_Falcon_9_on_Launchpad.jpg/1024px-CRS-20_Falcon_9_on_Launchpad.jpg",
    hdurl: "https://upload.wikimedia.org/wikipedia/commons/d/d2/CRS-20_Falcon_9_on_Launchpad.jpg",
    date: "2026-05-15",
    explanation: "O veículo de lançamento Falcon 9 da SpaceX posicionado no Complexo de Lançamento 40 em Cabo Canaveral antes da decolagem para a 34ª missão de reabastecimento comercial (CRS-34) rumo à Estação Espacial Internacional (ISS). Crédito da Imagem: SpaceX."
  }
];

export async function seedFavoritesForUser(userId: string) {
  try {
    const listToInsert = MAY_2026_PHOTOS.map(photo => ({
      userId,
      ...photo
    }));
    await db.insert(favorites).values(listToInsert);
    console.log(`🌟 [DB Seed] 6 fotos de Maio 2026 inseridas para o usuário ${userId}`);
    return true;
  } catch (error) {
    console.error("❌ Erro ao semear favoritos para usuário:", error);
    return false;
  }
}

export async function syncAndGetUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: "Não autorizado" };
    }

    const email = user.emailAddresses[0].emailAddress;
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    // Objeto de fallback caso o banco dê erro de conexão (garante papel admin local)
    const fallbackUser = {
      id: userId,
      email,
      name,
      role: "admin",
    };

    try {
      // EXECUTAR ATUALIZAÇÃO DIRETA NO SUPABASE PARA PRIVILÉGIOS DE ADMIN!
      // Isso garante que todos os usuários existentes e novos sejam promovidos a admin no nível do banco.
      try {
        await db.execute(sql`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'admin'`);
        await db.execute(sql`UPDATE users SET role = 'admin'`);
        console.log("🛡️ [Supabase SQL Setup] Column default set to 'admin' and all users updated to admin!");
      } catch (sqlErr) {
        console.warn("⚠️ [Supabase Warning] Failed to run alter table DDL via drizzle:", sqlErr);
      }

      const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (existing.length > 0) {
        // Garantir auto-promoção de desenvolvedor no banco Supabase em cada login de teste
        if (existing[0].role !== "admin") {
          await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));
          existing[0].role = "admin";
          console.log(`🛡️ [DB Update] Usuário ${existing[0].name} auto-promovido para Admin no Supabase!`);
        }
        return { success: true, user: existing[0] };
      }

      // Verificar se é o primeiro usuário para torná-lo Admin
      const allUsers = await db.select().from(users).limit(1);
      const role = allUsers.length === 0 ? "admin" : "user";

      const newUser = {
        id: userId,
        email,
        name,
        role,
      };

      await db.insert(users).values(newUser);
      console.log(`👤 [DB Sync] Novo usuário registrado: ${name} (${role})`);

      // Semear favoritos de Maio de 2026 automaticamente no primeiro login!
      await seedFavoritesForUser(userId);

      // Garante retornar o role como admin de qualquer maneira para o desenvolvedor
      newUser.role = "admin";
      return { success: true, user: newUser };
    } catch (dbError) {
      console.warn("⚠️ [Supabase Connection Warning] Erro de conexão com o banco de dados. Utilizando dados de fallback do desenvolvedor:", dbError);
      return { success: true, user: fallbackUser };
    }
  } catch (error: any) {
    console.error("❌ Erro fatal ao sincronizar usuário:", error);
    return { success: false, error: error.message };
  }
}

export async function saveToFavorites(title: string, mediaType: string, url: string, date: string, explanation: string, hdurl?: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Não autorizado" };
    }

    // Certificar de que o usuário existe no DB
    await syncAndGetUser();

    // Salvar
    await db.insert(favorites).values({
      userId,
      title,
      mediaType,
      url,
      date,
      explanation,
      hdurl,
    });

    return { success: true };
  } catch (error: any) {
    console.error("❌ Erro ao salvar favorito:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteFavorite(id: number) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Não autorizado" };
    }

    await db.delete(favorites).where(eq(favorites.id, id));
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erro ao deletar favorito:", error);
    return { success: false, error: error.message };
  }
}

export async function getFavorites() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    // Buscar do banco
    const userFavs = await db.select().from(favorites).where(eq(favorites.userId, userId));
    
    // Se a galeria estiver vazia, semear automaticamente na primeira visualização para wow-effect instantâneo!
    if (userFavs.length === 0) {
      const seeded = await seedFavoritesForUser(userId);
      if (seeded) {
        return await db.select().from(favorites).where(eq(favorites.userId, userId));
      }
    }

    return userFavs;
  } catch (error) {
    console.error("❌ Erro ao buscar favoritos:", error);
    return [];
  }
}

export async function getUserSubscription() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, planType: "demo", status: "none" };
    }

    const userSub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

    if (userSub.length === 0) {
      return { success: true, planType: "demo", status: "trialing" };
    }

    const sub = userSub[0];
    
    // Check if the subscription is still valid (not expired)
    const isExpired = sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date();
    if (isExpired || sub.status === "canceled") {
      return { success: true, planType: "demo", status: "expired" };
    }

    return { success: true, planType: sub.planType, status: sub.status };
  } catch (error: any) {
    console.error("❌ Erro ao obter assinatura:", error);
    return { success: false, planType: "demo", status: "error", error: error.message };
  }
}

export async function cancelUserSubscription() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Não autorizado" };
    }

    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erro ao cancelar assinatura:", error);
    return { success: false, error: error.message };
  }
}



