import cors from 'cors'
// Configurar el middleware cors
export const corsMiddleware = () => cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'https://www.groupexplorex.com/',
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.APP_URL
    ]

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed By CORS'))
  },
  credentials: true // Permite las credenciales (cookies, cabeceras de autorización, etc.)
})
