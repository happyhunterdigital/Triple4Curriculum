/**
 * PayFast checkout: create a signed payment session on the server, then submit
 * it as a normal form POST (PayFast requires a full-page redirect; card details
 * never pass through T4C or Firebase).
 */
import { httpsCallable } from "firebase/functions";
import { functions } from "./functions";

export interface PayfastCheckout {
  url: string;
  fields: Record<string, string>;
  sandbox?: boolean;
  mPaymentId?: string;
}

export async function createPayfastCheckout(payload: {
  plan: "monthly" | "annual";
  phase?: string;
}): Promise<PayfastCheckout | null> {
  try {
    const fn = httpsCallable<typeof payload, PayfastCheckout>(functions, "createPayfastCheckout");
    const res = await fn(payload);
    if (res.data?.url && res.data.fields) return res.data;
    return null;
  } catch {
    return null;
  }
}

/** POST the signed fields to PayFast; the browser navigates to their checkout. */
export function submitPayfastCheckout(checkout: PayfastCheckout): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkout.url;
  form.style.display = "none";

  Object.entries(checkout.fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
