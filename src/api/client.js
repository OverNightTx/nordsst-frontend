import axios from 'axios'
import { auth } from '../store/auth'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

client.interceptors.request.use((config) => {
  const key = auth.get()
  if (key) config.headers.Authorization = `Bearer ${key}`
  return config
})

export default client
