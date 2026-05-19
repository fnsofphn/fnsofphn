export const GIUP_CY_ONLY_EMAILS = new Set(["namcy@gmail.com"]);

export function isGiupCyOnlyEmail(email: string | null | undefined) {
  return Boolean(email && GIUP_CY_ONLY_EMAILS.has(email.toLowerCase()));
}

export function isGiupCyPath(pathname: string) {
  return pathname === "/app/giup-cy" || pathname.startsWith("/app/giup-cy/");
}
