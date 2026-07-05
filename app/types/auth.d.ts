declare module '#auth-utils' {
  interface User {
    id: number
    email: string
    name: string
    role: 'admin' | 'editor'
  }
}

export {}
