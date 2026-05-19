export const GIUP_CY_ONLY_EMAILS = new Set<string>([]);

export function isGiupCyOnlyEmail(email: string | null | undefined) {
  return Boolean(email && GIUP_CY_ONLY_EMAILS.has(email.toLowerCase()));
}

// href prefixes of nav items to hide per email
const HIDDEN_NAV_ITEMS: Record<string, string[]> = {
  "namcy@gmail.com": ["/app/trading"],
};

export function getHiddenNavItems(email: string | null | undefined): string[] {
  if (!email) return [];
  return HIDDEN_NAV_ITEMS[email.toLowerCase()] ?? [];
}

export function isGiupCyPath(pathname: string) {
  return pathname === "/app/giup-cy" || pathname.startsWith("/app/giup-cy/");
}
