/**
 * Staff sessions now live only in the Agafari admin panel
 * (see `src/lib/admin/session.ts`). Tenant sites are public-only, so all that
 * remains here is the event the API client raises when a token stops working.
 */
export const UNAUTHORIZED_EVENT = "clarity:unauthorized";
