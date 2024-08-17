/* eslint-disable camelcase */
import dotenv from 'dotenv'
import connectToDatabase from '../../config/dbConnection.js'

dotenv.config()

export class ReservationModels {
  // Obtener todas las reservas
  static async getAll ({ genre }) {
    const connection = await connectToDatabase()
    try {
      const [rows] = await connection.query('SELECT * FROM reservations')
      return rows
    } catch (error) {
      console.error(error)
      throw new Error('Error retrieving reservations')
    } finally {
      connection.release() // Liberar la conexión
    }
  }

  // Crear una nueva reserva
  static async create ({ input }) {
    const {
      user_id,
      first_name,
      last_name,
      email,
      phone,
      type_travel,
      origin,
      destination,
      departure_date,
      return_date,
      number_days,
      children_count,
      adults_count,
      aproximate_budget,
      message,
      state
    } = input

    const connection = await connectToDatabase()
    try {
      const [result] = await connection.query(
        `INSERT INTO reservations (user_id, first_name, last_name, email, phone, type_travel, origin, destination, departure_date, return_date, number_days, children_count, adults_count, aproximate_budget, message, state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          first_name,
          last_name,
          email,
          phone,
          type_travel,
          origin,
          destination,
          departure_date,
          return_date,
          number_days,
          children_count,
          adults_count,
          aproximate_budget,
          message,
          state
        ]
      )

      return {
        id: result.insertId,
        ...input
      }
    } catch (e) {
      throw new Error('Error creating reservation')
    } finally {
      connection.release() // Liberar la conexión
    }
  }

  // Obtener una reserva por ID
  static async getById (id) {
    const connection = await connectToDatabase()
    try {
      const [rows] = await connection.query('SELECT * FROM `reservations` WHERE id = ?', [id])
      if (rows.length > 0) {
        rows[0].aproximate_budget = parseFloat(rows[0].aproximate_budget)
        return rows[0]
      } else {
        throw new Error('Reservation not found')
      }
    } catch (error) {
      console.error(error)
      throw new Error('Error retrieving reservation')
    } finally {
      connection.release() // Liberar la conexión
    }
  }

  // Actualizar una reserva existente
  static async update ({ id, input }) {
    const {
      user_id,
      first_name,
      last_name,
      email,
      phone,
      type_travel,
      origin,
      destination,
      departure_date,
      return_date,
      number_days,
      children_count,
      adults_count,
      aproximate_budget,
      message,
      state
    } = input

    const connection = await connectToDatabase()
    try {
      const [result] = await connection.query(
        `UPDATE reservations 
         SET user_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, type_travel = ?, origin = ?, destination = ?, departure_date = ?, return_date = ?, number_days = ?, children_count = ?, adults_count = ?, aproximate_budget = ?, message = ?, state = ?
         WHERE id = ?`,
        [
          user_id,
          first_name,
          last_name,
          email,
          phone,
          type_travel,
          origin,
          destination,
          departure_date,
          return_date,
          number_days,
          children_count,
          adults_count,
          aproximate_budget,
          message,
          state,
          id
        ]
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
    } finally {
      connection.release() // Liberar la conexión
    }
  }

  // Eliminar una reserva por ID
  static async delete (id) {
    const connection = await connectToDatabase()
    try {
      // Inicia una transacción
      await connection.beginTransaction()

      // Elimina los pasajeros asociados a la reserva
      const [passengerResult] = await connection.query('DELETE FROM passengers WHERE reservation_id = ?;', [id])

      console.log(`Deleted ${passengerResult.affectedRows} passengers for reservation ID ${id}`)

      // Elimina la reserva
      const [reservationResult] = await connection.query('DELETE FROM reservations WHERE id = ?;', [id])

      console.log(`Deleted ${reservationResult.affectedRows} reservation(s) with ID ${id}`)

      // Confirma la transacción
      await connection.commit()

      return reservationResult.affectedRows > 0
    } catch (error) {
      // Deshacer la transacción en caso de error
      await connection.rollback()

      console.error('Error during delete transaction:', error)
      throw new Error('Error deleting reservation and associated passengers')
    } finally {
      connection.release() // Liberar la conexión
    }
  }
}
