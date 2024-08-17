import { ReservationModels } from '../models/mysql/reservationModels.js'
import { PassengerModels } from '../models/mysql/passengerModels.js'
import { validateReservation } from '../schemas/schema.js'
import { sendMail } from '../config/mailer.js'
import axios from 'axios'

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

export class ReservationController {
  static async getAll (req, res) {
    try {
      const { genre } = req.query
      const reservations = await ReservationModels.getAll({ genre })
      res.json(reservations)
    } catch (error) {
      res.status(500).send(error.message)
    }
  }

  static async create (req, res) {
    try {
      const recaptchaToken = req.body.recaptchaToken
      const recaptchaValidation = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: RECAPTCHA_SECRET_KEY,
            response: recaptchaToken
          }
        }
      )

      if (!recaptchaValidation.data.success) {
        return res.status(400).json({ error: 'Invalid reCAPTCHA' })
      }

      const result = await validateReservation(req.body)
      if (!result.success) {
        return res.status(422).json({ errors: result.error.errors })
      }

      const newReservation = await ReservationModels.create({ input: result.data })
      res.status(201).json(newReservation)

      // Envía un correo electrónico de alerta con los detalles de la reserva
      await sendMail({
        to: process.env.EMAIL_TO,
        subject: 'New Reservation Alert 📢',
        reservationDetails: {
          first_name: newReservation.first_name,
          last_name: newReservation.last_name,
          email: newReservation.email,
          phone: newReservation.phone,
          type_travel: newReservation.type_travel,
          origin: newReservation.origin,
          destination: newReservation.destination,
          departure_date: newReservation.departure_date,
          return_date: newReservation.return_date,
          number_days: newReservation.number_days,
          children_count: newReservation.children_count,
          adults_count: newReservation.adults_count,
          aproximate_budget: newReservation.aproximate_budget,
          message: newReservation.message,
          created_at: newReservation.created_at
        }
      })
    } catch (e) {
      res.status(500).json({ error: 'Error creating reservation' })
    }
  }

  static async getById (req, res) {
    try {
      const { id } = req.params
      const reservation = await ReservationModels.getById(id)
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
      const success = await ReservationModels.delete(id)
      if (success) {
        res.status(200).send('Reservation and associated passengers deleted successfully')
      } else {
        res.status(404).send('Reservation not found')
      }
    } catch (error) {
      console.error('Error in delete controller:', error.message)
      res.status(500).send(error.message)
    }
  }

  static async update (req, res) {
    try {
      const { id } = req.params
      const result = await validateReservation(req.body)

      if (!result.success) {
        return res.status(422).json({ errors: result.error.errors })
      }

      const updatedReservation = await ReservationModels.update({ id, input: result.data })
      if (!updatedReservation) {
        return res.status(404).json({ error: 'Reservation not found' })
      }

      res.status(200).json(updatedReservation)

      // Llamar al método para enviar el correo después de actualizar
      await ReservationController.sendMailWithPassengers(id)
    } catch (e) {
      if (e.message === 'Reservation not found') {
        res.status(404).json({ error: e.message })
      } else {
        res.status(500).json({ error: 'Error updating reservation' })
      }
    }
  }

  static async sendMailWithPassengers (reservationId) {
    try {
      const passengers = await PassengerModels.getByIdReservation(reservationId)
      const mailDetails = {
        to: process.env.EMAIL_TO,
        subject: 'Passenger 📢',
        passengers
      }

      await sendMail(mailDetails)
    } catch (e) {
      console.error('Error sending email:', e)
    }
  }
}
