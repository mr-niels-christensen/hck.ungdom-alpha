/**
 * Extracts a query parameter from either window.location.search or the hash part (e.g. /#/?pin=1234 or /#/lob?pin=1234).
 */
export function getUrlParam(name: string, customUrl?: string): string | null {
  try {
    let search = typeof window !== 'undefined' ? window.location.search : '';
    let hash = typeof window !== 'undefined' ? window.location.hash : '';

    if (customUrl) {
      const parsed = new URL(customUrl, 'https://example.com');
      search = parsed.search;
      hash = parsed.hash;
    }

    // 1. Check normal search query (?pin=...)
    if (search) {
      const params = new URLSearchParams(search);
      const val = params.get(name);
      if (val) return val;
    }

    // 2. Check hash query (/#/?pin=... or /#/lob?pin=...)
    if (hash && hash.includes('?')) {
      const hashQuery = hash.slice(hash.indexOf('?'));
      const params = new URLSearchParams(hashQuery);
      const val = params.get(name);
      if (val) return val;
    }

    return null;
  } catch {
    return null;
  }
}
