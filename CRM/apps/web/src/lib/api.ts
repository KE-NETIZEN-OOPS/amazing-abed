// API utility to normalize URLs and handle environment variables
export function getApiUrl(path: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  // Remove trailing slash from base URL
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
