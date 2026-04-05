import axios from 'axios'
import { auth } from '../store/auth'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://nordsst-backend.onrender.com'

const client = axios.create({
  baseURL: BASE_URL,
})

client.interceptors.request.use((config) => {
  const key = auth.get()
  if (key) config.headers['Authorization'] = `Bearer ${key}`
  return config
})

export default client
