/**
 * PayFast checkout: create a signed payment session on the server, then submit
 * it as a normal form POST (PayFast requires a full-page redirect; card details
 * never pass through T4C or Firebase).
 */
import { callable } from "./functions";

export interface PayfastCheckout {
  url: string;
  fields: Record<string, string>;
  sandbox?: boolean;
  mPaymentId?: string;
}

/** Turn a callable failure into something a parent can act on. */
export function payfastErrorMessage(error: unknown): string {
  const err = error as { code?: string; message?: string } | undefined;
  const serverMessage = err?.message && !/^functions\//.test(err.message) ? err.message : "";
  if (serverMessage) return serverMessage;
  switch (err?.code) {
    case "functions/unauthenticated":
      return "Your session expired - sign in again and retry the payment.";
    case "functions/failed-precondition":
      return "Payment is not available for this phase yet. Contact support@triple4c.com.";
    case "functions/unavailable":
    case "functions/deadline-exceeded":
      return "The payment service is temporarily unavailable. Please try again in a minute.";
    default:
      return "We could not open the PayFast checkout. Please try again, or email support@triple4c.com.";
  }
}

/**
 * Asks the server for a signed PayFast session. Throws a user-presentable
 * error (see payfastErrorMessage) instead of returning null, so callers can
 * show why checkout did not open.
 */
export async function createPayfastCheckout(payload: {
  plan: "monthly" | "annual";
  phase?: string;
}): Promise<PayfastCheckout> {
  const fn = await callable<typeof payload, PayfastCheckout>("createPayfastCheckout");
  const res = await fn(payload);
  if (!res.data?.url || !res.data.fields) {
    throw new Error("PayFast did not return a checkout link. Please try again.");
  }
  return res.data;
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
