export interface BillingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  tagline: string;
  features: string[];
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    tagline: "Get a single-bay shop up and running.",
    features: ["Up to 1 employee", "Job Board & Work Orders", "Customers & Vehicles", "Invoicing"],
  },
  {
    id: "basic",
    name: "Basic",
    monthlyPrice: 49,
    tagline: "For a small shop finding its footing.",
    features: [
      "Up to 5 employees",
      "Everything in Free",
      "Inventory & Purchase Orders",
      "Appointments calendar",
      "Reports",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 99,
    tagline: "For a growing shop that needs it all.",
    features: [
      "Unlimited employees",
      "Everything in Basic",
      "Canned Jobs & Markups",
      "Integrations (Carfax, PartsTech, SiriusXM)",
      "Priority support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 199,
    tagline: "For multi-bay shops and franchises.",
    features: ["Everything in Pro", "Multi-location support", "Dedicated account manager", "Custom onboarding"],
  },
];

export const DEFAULT_BILLING_PLAN_ID = "free";

export function getBillingPlan(id: string): BillingPlan | undefined {
  return BILLING_PLANS.find((plan) => plan.id === id);
}
