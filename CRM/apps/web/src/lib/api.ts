// API utility to normalize URLs and handle environment variables
export function getApiUrl(path: string = ''): string {
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  // Remove ALL trailing slashes from base URL
  baseUrl = baseUrl.replace(/\/+$/, '');
  
  // Remove leading slashes from path and ensure it starts with exactly one /
  const cleanPath = path.replace(/^\/+/, '');
  const normalizedPath = cleanPath ? `/${cleanPath}` : '';
  
  // Combine without double slashes
  return `${baseUrl}${normalizedPath}`;
}
