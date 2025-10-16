import { plugin } from 'gunshi'

export interface AuthExtension {
  isAuthenticated: () => boolean
  getUser: () => { id: string; name: string }
}

export function auth() {
  return plugin({
    id: 'auth',
    name: 'auth',
    extension: () => ({
      isAuthenticated: () => {
        // Implement your authentication logic here
        return true
      },
      getUser: () => {
        // Implement your user retrieval logic here
        return { id: '123', name: 'John Doe' }
      }
    })
  })
}
