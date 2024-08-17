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
let connection

async function initializeConnection () {
  try {
    connection = await mysql.createConnection(config)
    console.log('Connected to the database.')
  } catch (err) {
    console.error('Error connecting to the database:', err)
    setTimeout(initializeConnection, 2000) // Intentar reconectar después de 2 segundos
  }
}

// Inicializar la conexión
initializeConnection()

// Modelo de Usuarios
export class UserModels {
  // Obtener todos los usuarios
  static async getAll () {
    try {
      const [rows] = await connection.execute('SELECT * FROM users')
      return rows
    } catch (error) {
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
      const [result] = await connection.execute(
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

  // Obtener un usuario por ID
  static async getById (id) {
    try {
      const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [id])
      if (rows.length > 0) {
        return rows[0]
      } else {
        throw new Error('User not found')
      }
    } catch (error) {
      console.error(error)
      throw new Error('Error retrieving user')
    }
  }

  // Actualizar un usuario por ID
  static async update ({ id, input }) {
    const {
      username,
      password,
      email,
      created_at
    } = input

    try {
      const [result] = await connection.execute(
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
      console.error('Error en UserModels.update:', e)
      throw new Error('Error updating user')
    }
  }

  // Eliminar un usuario por ID
  static async delete (id) {
    // Verificar si el usuario existe
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    )

    if (users.length === 0) {
      return false // El usuario no existe
    }

    // Eliminar el usuario
    await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    )

    return true // El usuario fue eliminado
  }

  // Iniciar sesión
  static async login ({ email, password }) {
    // Verificar si el usuario existe
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
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
