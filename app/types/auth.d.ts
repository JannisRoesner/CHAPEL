declare module '#auth-utils' {
  interface User {
    id: number
    email: string
    name: string
    role: 'admin' | 'editor'
    mustChangePassword: boolean
    colorScheme: import('#shared/constants/colorSchemes').ColorSchemeId
    appearanceMode: import('#shared/constants/colorSchemes').AppearanceMode
  }
}

export {}
