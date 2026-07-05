export const CHAPEL_ICON_VIEWBOX = '0 0 512 512'

export const CHAPEL_ICON_PATH = 'M256 96c-8 0-14 6-14 14v42h-28c-6 0-11 5-11 11v28c0 6 5 11 11 11h28v28c0 6 5 11 11 11h28c6 0 11-5 11-11v-28h28c6 0 11-5 11-11v-28c0-6-5-11-11-11h-28v-42c0-8-6-14-14-14zm-84 140c-6 0-11 5-11 11v154c0 6 5 11 11 11h168c6 0 11-5 11-11V247c0-6-5-11-11-11H172zm28 42h112v98H200v-98z'

export function buildChapelIconSvg(primaryColor: string, backgroundColor?: string | null): string {
  const background = backgroundColor && backgroundColor !== 'transparent'
    ? `<rect width="512" height="512" rx="96" fill="${backgroundColor}"/>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CHAPEL_ICON_VIEWBOX}" role="img" aria-label="CHAPEL">${background}<path fill="${primaryColor}" d="${CHAPEL_ICON_PATH}"/></svg>`
}

export function buildChapelIconDataUrl(primaryColor: string, backgroundColor?: string | null): string {
  return `data:image/svg+xml,${encodeURIComponent(buildChapelIconSvg(primaryColor, backgroundColor))}`
}
