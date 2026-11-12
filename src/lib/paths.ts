// Site-relative URLs. The site may be served from a sub-path (GitHub Pages project
// site) or from a domain root, so every internal link goes through url().

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** url('/syllabus/') -> '/CS342/syllabus/' (or '/syllabus/' on a root domain). */
export function url(path = '/'): string {
  return base + (path.startsWith('/') ? path : `/${path}`);
}

export const isExternal = (href: string) => /^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('mailto:');
