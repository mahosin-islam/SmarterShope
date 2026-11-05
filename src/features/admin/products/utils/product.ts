export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_IMAGES = 10;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'h2',
  'h3',
  'blockquote',
  'code',
  'pre',
]);

const DISCARDED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input']);

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 200);
}

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeHtml(value: string): string {
  if (typeof window === 'undefined' || !value.trim()) return value.trim();

  const document = new DOMParser().parseFromString(value, 'text/html');

  const cleanNode = (parent: Node) => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        continue;
      }

      if (child.nodeType !== Node.ELEMENT_NODE) continue;

      const element = child as HTMLElement;
      const tag = element.tagName.toLowerCase();

      if (DISCARDED_TAGS.has(tag)) {
        element.remove();
        continue;
      }

      if (!ALLOWED_TAGS.has(tag)) {
        element.replaceWith(...Array.from(element.childNodes));
        continue;
      }

      for (const attribute of Array.from(element.attributes)) {
        if (tag === 'a' && attribute.name.toLowerCase() === 'href') continue;
        element.removeAttribute(attribute.name);
      }

      if (tag === 'a') {
        const href = element.getAttribute('href')?.trim() ?? '';
        const isSafe =
          href.startsWith('https://') ||
          href.startsWith('http://') ||
          href.startsWith('mailto:') ||
          href.startsWith('/');

        if (!isSafe) {
          element.replaceWith(...Array.from(element.childNodes));
          continue;
        }

        element.setAttribute('rel', 'noopener noreferrer');
      }

      cleanNode(element);
    }
  };

  cleanNode(document.body);
  return document.body.innerHTML.trim();
}

export function formatMoney(value: number | undefined, currency = 'USD'): string {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function buildVariantSku(
  baseSku: string,
  attributes: Record<string, string>,
  index: number,
): string {
  const suffix = Object.values(attributes)
    .map((value) => slugify(value).toUpperCase())
    .filter(Boolean)
    .join('-');
  const prefix = slugify(baseSku).toUpperCase();
  const sku = [prefix, suffix].filter(Boolean).join('-');

  return (sku || `VARIANT-${index + 1}`).slice(0, 100);
}

export function splitCommaList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueList(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
