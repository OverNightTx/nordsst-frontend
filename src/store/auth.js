const KEY = 'nordsst_api_key'

export const auth = {
  get: () => localStorage.getItem(KEY),
  set: (key) => localStorage.setItem(KEY, key),
  clear: () => localStorage.removeItem(KEY),
  isAuthenticated: () => !!localStorage.getItem(KEY),
}
