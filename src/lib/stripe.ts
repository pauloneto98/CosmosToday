import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock_secret_key_12345";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-11-20.accredited" as any, // Versão recomendada para Next.js 15
  appInfo: {
    name: "CosmosDaily",
    version: "0.1.0",
  },
});
