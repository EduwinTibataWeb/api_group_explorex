import { Router } from 'express'

import { ReservationController } from '../controllers/reservation.js'
import { UserController } from '../controllers/user.js'
import { PassengerController } from '../controllers/passenger.js'

export const reservationRouter = Router()

// Reservation

reservationRouter.get('/reservation', ReservationController.getAll)
reservationRouter.post('/reservation', ReservationController.create)

reservationRouter.get('/reservation/:id', ReservationController.getById)
reservationRouter.delete('/reservation/:id', ReservationController.delete)
reservationRouter.patch('/reservation/:id', ReservationController.update)

// User
reservationRouter.get('/user', UserController.getAll)
reservationRouter.post('/user', UserController.create)
reservationRouter.post('/login', UserController.login)
reservationRouter.get('/userlogin', UserController.userLogin)
reservationRouter.post('/refreshuserlogin', UserController.refreshUserLogin)

reservationRouter.get('/user/:id', UserController.getById)
reservationRouter.delete('/user/:id', UserController.delete)
reservationRouter.patch('/user/:id', UserController.update)

// passenger
reservationRouter.get('/passenger', PassengerController.getAll)
reservationRouter.post('/passenger', PassengerController.create)

reservationRouter.get('/passenger/:id', PassengerController.getById)
reservationRouter.get('/passenger/reservation/:id', PassengerController.getByIdReservation)
reservationRouter.delete('/passenger/:id', PassengerController.delete)
reservationRouter.patch('/passenger/:id', PassengerController.update)
