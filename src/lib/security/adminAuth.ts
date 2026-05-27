const ADMIN_HASH_STORAGE_KEY = 'classgallery-admin-password-hash';

const configuredAdminHash = ((import.meta.env.VITE_CLASSGALLERY_ADMIN_HASH as string | undefined) ?? '').trim();

export type AdminPasswordMode = 'configured' | 'local-setup';

function localHash(): string {
  try {
    return localStorage.getItem(ADMIN_HASH_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function getAdminPasswordMode(): AdminPasswordMode {
  return configuredAdminHash ? 'configured' : 'local-setup';
}

export function hasAdminPassword(): boolean {
  return Boolean(configuredAdminHash || localHash());
}

export async function createPasswordHash(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const expectedHash = configuredAdminHash || localHash();
  if (!expectedHash) return false;
  const actualHash = await createPasswordHash(password);
  return actualHash === expectedHash;
}

export async function initializeLocalAdminPassword(password: string): Promise<void> {
  if (configuredAdminHash) return;
  const hash = await createPasswordHash(password);
  localStorage.setItem(ADMIN_HASH_STORAGE_KEY, hash);
}
