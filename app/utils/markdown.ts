import { marked } from 'marked'

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'blockquote', 'code', 'pre', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td'
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'rel', 'target']),
  th: new Set(['colspan', 'rowspan']),
  td: new Set(['colspan', 'rowspan'])
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/<(\/?)([\w-]+)([^>]*)>/g, (match, slash, tagName, attrs) => {
      const tag = tagName.toLowerCase()
      if (!ALLOWED_TAGS.has(tag)) return ''

      if (slash) return `</${tag}>`

      const allowedAttrs = ALLOWED_ATTRS[tag]
      if (!allowedAttrs || !attrs) return `<${tag}>`

      const safeAttrs: string[] = []
      const attrRegex = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
      let attrMatch: RegExpExecArray | null

      while ((attrMatch = attrRegex.exec(attrs)) !== null) {
        const name = attrMatch[1]?.toLowerCase()
        if (!name) continue
        const value = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? ''
        if (!allowedAttrs.has(name)) continue

        if (name === 'href' && /^\s*javascript:/i.test(value)) continue

        safeAttrs.push(`${name}="${value.replace(/"/g, '&quot;')}"`)
      }

      return safeAttrs.length ? `<${tag} ${safeAttrs.join(' ')}>` : `<${tag}>`
    })
}

export function renderMarkdown(source: string): string {
  if (!source.trim()) return ''

  const html = marked.parse(source, {
    async: false,
    breaks: true,
    gfm: true
  }) as string

  return sanitizeHtml(html)
}
