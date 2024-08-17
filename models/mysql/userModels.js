/* eslint-disable camelcase */
import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

// Cargar las variables de entorno desde el archivo .env
dotenv.config()
// Configurar la conexión a MySQL
const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE
}

// Crear una conexión a la base de datos
const connection = await mysql.createConnection(config)

// Modelo de Reservas
export class UserModels {
  // Obtener todas las reservas
  static async getAll ({ genre }) {
    try {
      const [rows] = await connection.query('SELECT * FROM users')
      return rows
    } catch (error) {
      console.error('entro')
      console.error(error)
      throw new Error('Error retrieving users')
    }
  }

  // Crear un nuevo usuario
  static async create ({ input }) {
    const {
      username,
      password,
      email,
      created_at
    } = input

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      console.log('Datos de entrada:', input)
      const [result] = await connection.query(
        `INSERT INTO users (username, password, email, created_at)
            VALUES (?, ?, ?, ?)`,
        [username, hashedPassword, email, created_at]
      )
      return {
        ...input,
        id: result.insertId, // Retorna el ID del usuario creado
        password: hashedPassword // Opcional: Puedes devolver la contraseña hasheada si es necesario
      }
    } catch (e) {
      console.error('Error en UserModels.create:', e)
      throw new Error('Error creating user')
    }
  }

  // Obtener una reserva por ID
  static async getById (id) {
    try {
      const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id])
      if (rows.length > 0) {
        return rows[0]
      } else {
        throw new Error('Reservation not found')
      }
    } catch (error) {
      console.error(error)
      throw new Error('Error retrieving reservation')
    }
  }

  // Actualizar una reserva por ID
  // Actualizar una reserva existente
  static async update ({ id, input }) {
    const {
      username,
      password,
      email,
      created_at
    } = input

    try {
      const [result] = await connection.query(
                `UPDATE reservations 
                    SET username = ?, password = ?, email = ?, created_at = ?
                    WHERE id = ?`,
                [username, password, email, created_at]
      )

      if (result.affectedRows === 0) {
        throw new Error('Reservation not found')
      }

      return {
        id,
        ...input
      }
    } catch (e) {
      throw new Error('Error updating reservation')
    }
  }

  // Eliminar una reserva por ID
  static async delete (id) {
    // Verificar si la reserva existe
    const [users] = await connection.query(
      'SELECT * FROM users WHERE id = ?;',
      [id]
    )

    if (users.length === 0) {
      return false // La reserva no existe
    }

    // Eliminar la reserva
    await connection.query(
      'DELETE FROM users WHERE id = ?;',
      [id]
    )

    return true // La reserva fue eliminada
  }

  static async login ({ email, password }) {
    // Verificar si el usuario existe
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?;',
      [email]
    )

    if (users.length === 0) {
      throw new Error('Email does not exist ' + email)
    }

    // Obtener el primer usuario (ya que `users` es un array)
    const user = users[0]

    // Comparar la contraseña proporcionada con la contraseña almacenada
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('Password is invalid')
    }

    // Excluir el campo `password` del objeto `user` antes de retornarlo
    const { password: _, ...publicUser } = user
    return publicUser
  }
}
