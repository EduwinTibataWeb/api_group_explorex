/* eslint-disable camelcase */
import mysql from 'mysql2/promise'
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
export class PassengerModels {
  // Obtener todas las reservas
  static async getAll ({ genre }) {
    try {
      const [rows] = await connection.query('SELECT * FROM passengers')
      return rows
    } catch (error) {
      console.error(error)
      throw new Error('Error retrieving passengers')
    }
  }

  // Crear un nuevo usuario
  static async create ({ input }) {
    const {
      reservation_id,
      type,
      first_name,
      last_name,
      birth_date,
      gender,
      nationality,
      created_at
    } = input

    try {
      console.log('Datos de entrada:', input)
      const [result] = await connection.query(
                `INSERT INTO passengers (reservation_id, type, first_name, last_name, birth_date, gender, nationality, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [reservation_id, type, first_name, last_name, birth_date, gender, nationality, created_at]
      )

      return {
        ...input,
        id: result.insertId // Retorna el ID del usuario creado
      }
    } catch (e) {
      console.error('Error en UserModels.create:', e)
      throw new Error('Error creating user')
    }
  }

  // Obtener una reserva por ID
  static async getById (id) {
    try {
      const [rows] = await connection.query('SELECT * FROM passengers WHERE id = ?', [id])
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

  // Obtener una reserva por ID de reserva
  static async getByIdReservation (reservationId) {
    try {
      const [rows] = await connection.query('SELECT * FROM passengers WHERE reservation_id = ?', [reservationId])
      return rows // Asegúrate de que rows es un array
    } catch (error) {
      console.error('Error fetching passengers:', error)
      throw error
    }
  }

  // Actualizar una reserva por ID
  // Actualizar una reserva existente
  static async update ({ id, input }) {
    const {
      reservation_id,
      type,
      first_name,
      last_name,
      birth_date,
      gender,
      nationality,
      created_at
    } = input

    try {
      const [result] = await connection.query(
                `UPDATE passengers SET reservation_id = ?, type = ?, first_name = ?, last_name = ?, birth_date = ?, gender = ?, nationality = ?, created_at = ?
                    WHERE id = ?`,
                [reservation_id, type, first_name, last_name, birth_date, gender, nationality, created_at, id]
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
    const [passengers] = await connection.query(
      'SELECT * FROM passengers WHERE id = ?;',
      [id]
    )

    if (passengers.length === 0) {
      return false // La reserva no existe
    }

    // Eliminar la reserva
    await connection.query(
      'DELETE FROM passengers WHERE id = ?;',
      [id]
    )

    return true // La reserva fue eliminada
  }
}
