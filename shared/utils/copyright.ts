import { APP_NAME } from '#shared/constants/app'

export function formatCopyrightNotice(copyrightHolder: string, year = new Date().getFullYear()): string {
  const holder = copyrightHolder.trim() || APP_NAME
  return `© ${year} ${holder}`
}
