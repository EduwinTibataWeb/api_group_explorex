import express, { json } from 'express'
import { reservationRouter } from './routes/router.js' // Importar el router
import { corsMiddleware } from './middlewares/cors.js'
import cookieParser from 'cookie-parser'

const app = express()
app.use(json())
app.use(corsMiddleware())
app.disable('x-powered-by')
app.use(cookieParser())
// Usar el router
app.use('/api', reservationRouter)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
