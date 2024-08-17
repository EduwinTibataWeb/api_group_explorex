/* eslint-disable camelcase */
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import connectToDatabase from '../../config/dbConnection.js'

dotenv.config()

export class UserModels {
  // Obtener todos los usuarios
  static async getAll ({ genre }) {
    const connection = await connectToDatabase()
    try {
      const [rows] = await connection.query('SELECT * FROM users')
      return rows
    } catch (error) {
      console.error(error)
      throw new Error('Error retrieving users')
    } finally {
      connection.release() // Libera la conexión de vuelta al pool
    }
  }

  // Crear un nuevo usuario
  static async create ({ input }) {
    const { username, password, email, created_at } = input
    const hashedPassword = await bcrypt.hash(password, 10)

    const connection = await connectToDatabase()
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
    } finally {
      connection.release() // Libera la conexión de vuelta al pool
    }
  }

  // Obtener un usuario por ID
  static async getById (id) {
    const connection = await connectToDatabase()
    try {
      const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id])
      if (rows.length > 0) {
        return rows[0]
      } else {
        throw new Error('User not found')
      }
    } catch (error) {
      console.error(error)
      throw new Error('Error retrieving user')
    } finally {
      connection.release() // Libera la conexión de vuelta al pool
    }
  }

  // Actualizar un usuario por ID
  static async update ({ id, input }) {
    const { username, password, email, created_at } = input
    const connection = await connectToDatabase()

    try {
      const [result] = await connection.query(
        `UPDATE users 
         SET username = ?, password = ?, email = ?, created_at = ?
         WHERE id = ?`,
        [username, password, email, created_at, id]
      )

      if (result.affectedRows === 0) {
        throw new Error('User not found')
      }

      return {
        id,
        ...input
      }
    } catch (e) {
      console.error('Error updating user:', e)
      throw new Error('Error updating user')
    } finally {
      connection.release() // Libera la conexión de vuelta al pool
    }
  }

  // Eliminar un usuario por ID
  static async delete (id) {
    const connection = await connectToDatabase()

    try {
      // Verificar si el usuario existe
      const [users] = await connection.query('SELECT * FROM users WHERE id = ?;', [id])

      if (users.length === 0) {
        return false // El usuario no existe
      }

      // Eliminar el usuario
      await connection.query('DELETE FROM users WHERE id = ?;', [id])

      return true // El usuario fue eliminado
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error('Error deleting user')
    } finally {
      connection.release() // Libera la conexión de vuelta al pool
    }
  }

  // Autenticación de usuario
  static async login ({ email, password }) {
    const connection = await connectToDatabase()

    try {
      // Verificar si el usuario existe
      const [users] = await connection.query('SELECT * FROM users WHERE email = ?;', [email])

      if (users.length === 0) {
        throw new Error('Email does not exist ' + email)
      }

      const user = users[0]

      // Comparar la contraseña proporcionada con la almacenada
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        throw new Error('Password is invalid')
      }

      // Excluir el campo `password` del objeto `user` antes de retornarlo
      const { password: _, ...publicUser } = user
      return publicUser
    } catch (error) {
      console.error('Error logging in:', error)
      throw new Error('Error logging in')
    } finally {
      connection.release() // Libera la conexión de vuelta al pool
    }
  }
}
