import { UserModels } from '../models/mysql/userModels.js'
import { validateUser } from '../schemas/schema.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

// Cargar las variables de entorno desde el archivo .env
dotenv.config()

export class UserController {
  static async getAll (req, res) {
    try {
      const { genre } = req.query
      const reservations = await UserModels.getAll({ genre })
      res.json(reservations)
    } catch (error) {
      res.status(500).send(error.message)
    }
  }

  static async create (req, res) {
    try {
      console.log('Cuerpo de la solicitud:', req.body)
      const result = await validateUser(req.body)
      if (!result.success) {
        // Accede a los errores de validación de Zod
        console.log('Errores de validación:', result.error.errors)
        return res.status(422).json({ errors: result.error.errors })
      }

      const newUser = await UserModels.create({ input: result.data })
      res.status(201).json(newUser)
    } catch (e) {
      console.error('Error en UserController.create:', e)
      res.status(500).json({ error: 'Error creating user' })
    }
  }

  static async getById (req, res) {
    try {
      const { id } = req.params
      const reservation = await UserModels.getById(id)
      if (reservation) {
        res.json(reservation)
      } else {
        res.status(404).send('Reservation not found')
      }
    } catch (error) {
      res.status(500).send(error.message)
    }
  }

  static async delete (req, res) {
    try {
      const { id } = req.params
      const success = await UserModels.delete(id)
      if (success) {
        res.status(200).send('Reservation deleted successfully')
      } else {
        res.status(404).send('Reservation not found')
      }
    } catch (error) {
      res.status(500).send(error.message)
    }
  }

  static async update (req, res) {
    try {
      const id = req.params.id // Suponiendo que el ID de la reserva se pasa como parámetro en la URL
      const result = await validateUser(req.body)

      if (!result.success) {
        // Accede a los errores de validación de Zod
        return res.status(422).json({ errors: result.error.errors })
      }
      const updatedReservation = await UserModels.update({ id, input: result.data })
      res.status(200).json(updatedReservation)
    } catch (e) {
      if (e.message === 'Reservation not found') {
        res.status(404).json({ error: e.message })
      } else {
        res.status(500).json({ error: 'Error updating reservation' })
      }
    }
  }

  static async login (req, res) {
    const { email, password } = req.body
    try {
      const user = await UserModels.login({ email, password })
      const accessToken = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.SECRET_KEY, {
        expiresIn: '1h'
      })
      const refreshToken = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.SECRET_KEY_REFRESH, {
        expiresIn: '7d' // El token de refresco tiene una vida útil más larga
      })

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1 hora
      })

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800000 // 7 días
      }).send({ user, accessToken, refreshToken })
    } catch (error) {
      res.status(401).send(error.message)
    }
  }

  static async userLogin (req, res) {
    const token = req.cookies.access_token
    if (!token) {
      return res.status(403).send('Access not authorized')
    }
    try {
      const data = jwt.verify(token, process.env.SECRET_KEY)
      return res.json(data)
    } catch (error) {
      return res.status(403).send('Access not authorized')
    }
  }

  static async refreshUserLogin (req, res) {
    const refreshToken = req.cookies.refresh
    if (!refreshToken) {
      return res.status(403).send('Access not authorized')
    }

    try {
      // Verificar el token de refresco
      const data = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH)

      // Generar un nuevo token de acceso
      const newAccessToken = jwt.sign(
        { id: data.id, username: data.username, email: data.email },
        process.env.SECRET_KEY,
        { expiresIn: '7d' }
      )

      // Enviar el nuevo token de acceso al cliente
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800000 // 1 hora
      }).send({ accessToken: newAccessToken })
    } catch (error) {
      return res.status(403).send('Access not authorized')
    }
  }
}
