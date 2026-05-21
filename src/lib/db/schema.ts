import { pgTable, text, timestamp, serial, varchar } from "drizzle-orm/pg-core";

// Tabela de Usuários (sincronizada via Clerk/Autenticação)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk User ID
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de Assinaturas (Stripe)
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),
  status: varchar("status", { length: 50 }).notNull(), // active, trialing, canceled, past_due
  planType: varchar("plan_type", { length: 50 }).notNull().default("free"), // free, explorer, family
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de Favoritos (Itens da Galeria Pessoal do Usuário)
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  mediaType: varchar("media_type", { length: 20 }).notNull().default("image"), // image, video
  url: text("url").notNull(),
  hdurl: text("hdurl"),
  date: varchar("date", { length: 20 }).notNull(), // 'YYYY-MM-DD'
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de Histórico de Buscas
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  query: text("query").notNull(),
  searchType: varchar("search_type", { length: 50 }).notNull(), // asteroids, exoplanets, epic, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
