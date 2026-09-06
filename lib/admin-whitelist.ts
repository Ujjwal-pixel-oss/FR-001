/**
 * Centralized Admin Email Whitelist
 * 
 * You can add more admin emails in .env.local or Vercel Environment Variables:
 * NEXT_PUBLIC_ADMIN_EMAILS="admin1@gmail.com,admin2@gmail.com"
 */

const DEFAULT_ADMIN_EMAILS = [
    "ujjwal.bright22@gmail.com",
];

export function getAdminEmails(): string[] {
    const envAdmins =
        (typeof process !== "undefined"
            ? process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS
            : "") || "";

    const customAdmins = envAdmins
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    return Array.from(
        new Set([
            ...DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()),
            ...customAdmins,
        ])
    );
}

export function isAdmin(email: string | null | undefined): boolean {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();
    return getAdminEmails().includes(normalized);
}
