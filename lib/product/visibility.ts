import type { GatewayProduct } from "./types";

export type Audience = "customer" | "staff";

/**
 * Showrooms routinely display products that are not live on the website yet — new
 * ranges, samples, pre-launch pieces. The gateway query deliberately does not filter
 * on `status`, so staff can scan those labels and still get a record.
 *
 * Customers must not: showing a draft product's price to a walk-in customer is not
 * acceptable. So the record is fetched either way and the decision is made here.
 */
export function isVisibleTo(
  product: Pick<GatewayProduct, "status" | "catalogVisibility">,
  audience: Audience,
): boolean {
  if (audience === "staff") return true;
  return product.status === "publish" && product.catalogVisibility !== "hidden";
}
