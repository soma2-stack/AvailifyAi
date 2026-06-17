/**
 * Billing configuration for AvailifyAi's paid tiers.
 *
 * Payments use **Stripe Payment Links** — there is no backend, no database,
 * and no secret key in this app. Create the links in your Stripe dashboard
 * (Products → Payment Links) and paste the resulting `https://buy.stripe.com/…`
 * URLs into your environment as the NEXT_PUBLIC_ variables below. Because they
 * are NEXT_PUBLIC, they are safe to expose to the browser — never put a secret
 * Stripe key (`sk_…`) here.
 */

export type PaidPlan = "Pro" | "Business";

export interface PlanInfo {
  /** Display name shown on the pricing card. */
  name: PaidPlan;
  /** Display price, e.g. "$10". */
  price: string;
  /** Billing cadence shown next to the price. */
  cadence: string;
  /** Environment variable that holds this plan's Stripe Payment Link. */
  envVar: string;
}

export const PLANS: Record<PaidPlan, PlanInfo> = {
  Pro: {
    name: "Pro",
    price: "$10",
    cadence: "/mo",
    envVar: "NEXT_PUBLIC_STRIPE_PRO_PAYMENT_LINK",
  },
  Business: {
    name: "Business",
    price: "$29",
    cadence: "/mo",
    envVar: "NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK",
  },
};

/**
 * Stripe Payment Links, read from the environment.
 *
 * `process.env.NEXT_PUBLIC_*` is inlined at build time by Next.js, so these
 * references must stay literal. An unset link resolves to "" — callers should
 * treat an empty string as "not configured yet" and degrade gracefully.
 */
export const STRIPE_PRO_PAYMENT_LINK =
  process.env.NEXT_PUBLIC_STRIPE_PRO_PAYMENT_LINK ?? "";

export const STRIPE_BUSINESS_PAYMENT_LINK =
  process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK ?? "";

/** The Payment Link for a given paid plan ("" when not configured). */
export function paymentLinkFor(plan: PaidPlan): string {
  return plan === "Pro"
    ? STRIPE_PRO_PAYMENT_LINK
    : STRIPE_BUSINESS_PAYMENT_LINK;
}
