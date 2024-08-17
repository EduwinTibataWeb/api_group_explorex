import { PassengerModels } from '../models/mysql/passengerModels.js'
import { validatePassenger } from '../schemas/schema.js'

export class PassengerController {
  static async getAll (req, res) {
    try {
      const { genre } = req.query
      const passengers = await PassengerModels.getAll({ genre })
      res.json(passengers)
    } catch (error) {
      res.status(500).send(error.message)
    }
  }

  static async create (req, res) {
    try {
      const result = await validatePassenger(req.body)
      if (!result.success) {
        // Accede a los errores de validación de Zod
        return res.status(422).json({ errors: result.error.errors })
      }

      const newPassenger = await PassengerModels.create({ input: result.data })
      res.status(201).json(newPassenger)
    } catch (e) {
      res.status(500).json({ error: 'Error creating Passenger' })
    }
  }

  static async getById (req, res) {
    try {
      const { id } = req.params
      const Passenger = await PassengerModels.getById(id)
      if (Passenger) {
        res.json(Passenger)
      } else {
        res.status(404).send('Passenger not found')
      }
    } catch (error) {
      res.status(500).send(error.message)
    }
  }

  static async getByIdReservation (req, res) {
    try {
      const { id } = req.params
      const Passenger = await PassengerModels.getByIdReservation(id)
      if (Passenger) {
        res.json(Passenger)
      } else {
        res.status(404).send('Passenger not found')
      }
    } catch (error) {
      res.status(500).send(error.message)
    }
  }

  static async delete (req, res) {
    try {
      const { id } = req.params
      const success = await PassengerModels.delete(id)
      if (success) {
        res.status(200).send('Passenger deleted successfully')
      } else {
        res.status(404).send('Passenger not found')
      }
    } catch (error) {
      res.status(500).send(error.message)
    }
  }

  static async update (req, res) {
    try {
      const id = req.params.id // Suponiendo que el ID de la reserva se pasa como parámetro en la URL
      const result = await validatePassenger(req.body)

      if (!result.success) {
        // Accede a los errores de validación de Zod
        return res.status(422).json({ errors: result.error.errors })
      }
      const updatedPassenger = await PassengerModels.update({ id, input: result.data })
      res.status(200).json(updatedPassenger)
    } catch (e) {
      if (e.message === 'Passenger not found') {
        res.status(404).json({ error: e.message })
      } else {
        res.status(500).json({ error: 'Error updating Passenger' })
      }
    }
  }
}
