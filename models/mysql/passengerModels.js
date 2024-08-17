/* eslint-disable camelcase */
import dotenv from 'dotenv'
import connectToDatabase from '../../config/dbConnection.js'

// Cargar las variables de entorno desde el archivo .env
dotenv.config()

export class PassengerModels {
  // Obtener todas las reservas
  static async getAll ({ genre }) {
    const connection = await connectToDatabase()
    try {
      const [rows] = await connection.query('SELECT * FROM passengers')
      return rows
    } catch (error) {
      console.error(error)
      throw new Error('Error retrieving passengers')
    } finally {
      connection.release() // Liberar la conexión
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

    const connection = await connectToDatabase()
    try {
      console.log('Datos de entrada:', input)
      const [result] = await connection.query(
        `INSERT INTO passengers (reservation_id, type, first_name, last_name, birth_date, gender, nationality, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reservation_id,
          type,
          first_name,
          last_name,
          birth_date,
          gender,
          nationality,
          created_at
        ]
      )

      return {
        ...input,
        id: result.insertId // Retorna el ID del usuario creado
      }
    } catch (e) {
      console.error('Error en PassengerModels.create:', e)
      throw new Error('Error creating passenger')
    } finally {
      connection.release() // Liberar la conexión
    }
  }

  // Obtener una reserva por ID
  static async getById (id) {
    const connection = await connectToDatabase()
    try {
      const [rows] = await connection.query('SELECT * FROM passengers WHERE id = ?', [id])
      if (rows.length > 0) {
        return rows[0]
      } else {
        throw new Error('Passenger not found')
      }
    } catch (error) {
      console.error(error)
      throw new Error('Error retrieving passenger')
    } finally {
      connection.release() // Liberar la conexión
    }
  }

  // Obtener una reserva por ID de reserva
  static async getByIdReservation (reservationId) {
    const connection = await connectToDatabase()
    try {
      const [rows] = await connection.query('SELECT * FROM passengers WHERE reservation_id = ?', [reservationId])
      return rows // Asegúrate de que rows es un array
    } catch (error) {
      console.error('Error fetching passengers:', error)
      throw error
    } finally {
      connection.release() // Liberar la conexión
    }
  }

  // Actualizar un pasajero existente
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

    const connection = await connectToDatabase()
    try {
      const [result] = await connection.query(
        `UPDATE passengers SET reservation_id = ?, type = ?, first_name = ?, last_name = ?, birth_date = ?, gender = ?, nationality = ?, created_at = ?
         WHERE id = ?`,
        [reservation_id, type, first_name, last_name, birth_date, gender, nationality, created_at, id]
      )

      if (result.affectedRows === 0) {
        throw new Error('Passenger not found')
      }

      return {
        id,
        ...input
      }
    } catch (e) {
      throw new Error('Error updating passenger')
    } finally {
      connection.release() // Liberar la conexión
    }
  }

  // Eliminar un pasajero por ID
  static async delete (id) {
    const connection = await connectToDatabase()
    try {
      // Verificar si el pasajero existe
      const [passengers] = await connection.query(
        'SELECT * FROM passengers WHERE id = ?;',
        [id]
      )

      if (passengers.length === 0) {
        return false // El pasajero no existe
      }

      // Eliminar el pasajero
      await connection.query('DELETE FROM passengers WHERE id = ?;', [id])

      return true // El pasajero fue eliminado
    } catch (error) {
      console.error('Error deleting passenger:', error)
      throw new Error('Error deleting passenger')
    } finally {
      connection.release() // Liberar la conexión
    }
  }
}
