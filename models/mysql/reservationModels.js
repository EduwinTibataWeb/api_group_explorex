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
export class ReservationModels {
  // Obtener todas las reservas
  static async getAll ({ genre }) {
    try {
      const [rows] = await connection.query('SELECT * FROM reservations')
      return rows
    } catch (error) {
      console.error(error)
      throw new Error('Error retrieving reservations')
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

    try {
      const [result] = await connection.query(
        `INSERT INTO reservations (user_id, first_name, last_name, email, phone, type_travel, origin, destination, departure_date, return_date, number_days, children_count, adults_count, aproximate_budget, message, state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, first_name, last_name, email, phone, type_travel, origin, destination, departure_date, return_date, number_days, children_count, adults_count, aproximate_budget, message, state]
      )

      return {
        id: result.insertId,
        ...input
      }
    } catch (e) {
      throw new Error('Error creating reservation')
    }
  }

  // Obtener una reserva por ID
  static async getById (id) {
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

    try {
      const [result] = await connection.query(
        `UPDATE reservations 
         SET user_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, type_travel = ?, origin = ?, destination = ?, departure_date = ?, return_date = ?, number_days = ?, children_count = ?, adults_count = ?, aproximate_budget = ?, message = ?, state = ?
         WHERE id = ?`,
        [user_id, first_name, last_name, email, phone, type_travel, origin, destination, departure_date, return_date, number_days, children_count, adults_count, aproximate_budget, message, state, id]
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
    try {
      // Inicia una transacción
      await connection.beginTransaction()

      // Elimina los pasajeros asociados a la reserva
      const [passengerResult] = await connection.query(
        'DELETE FROM passengers WHERE reservation_id = ?;',
        [id]
      )

      // Verifica si se eliminaron pasajeros
      console.log(`Deleted ${passengerResult.affectedRows} passengers for reservation ID ${id}`)

      // Elimina la reserva
      const [reservationResult] = await connection.query(
        'DELETE FROM reservations WHERE id = ?;',
        [id]
      )

      // Verifica si se eliminó la reserva
      console.log(`Deleted ${reservationResult.affectedRows} reservation(s) with ID ${id}`)

      // Confirma la transacción
      await connection.commit()

      // Devuelve verdadero si se eliminó al menos una fila en las tablas
      return reservationResult.affectedRows > 0
    } catch (error) {
      // Si hay un error, deshace la transacción
      await connection.rollback()

      // Registra el error para depuración
      console.error('Error during delete transaction:', error)

      throw new Error('Error deleting reservation and associated passengers')
    }
  }
}
