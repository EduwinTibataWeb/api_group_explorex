import { z } from 'zod'

// Define el esquema de usuario
const userSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  email: z.string().email('Email must be valid'),
  created_at: z.string().datetime().default(() => new Date())
})

// Define el esquema de reserva
const reservationSchema = z.object({
  user_id: z.number().int().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Email must be valid').optional(),
  phone: z.string().optional(),
  type_travel: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  departure_date: z.string().optional(),
  return_date: z.string().optional(),
  number_days: z.number().int().optional(),
  children_count: z.number().int().nonnegative().optional(),
  adults_count: z.number().int().positive().optional(),
  aproximate_budget: z.number().optional(),
  message: z.string().optional(),
  created_at: z.string().optional(),
  state: z.number().int().default(1)
})

// Define el esquema de pasajero
const passengerSchema = z.object({
  reservation_id: z.string().uuid().min(1, 'User ID is required'),
  type: z.enum(['adult', 'child']),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  birth_date: z.string().min(1, 'departure is required'),
  gender: z.enum(['male', 'female', 'other']),
  nationality: z.string().min(1, 'Nationality is required'),
  created_at: z.string().min(1, 'Origin is required')
})

// Función para validar un objeto de usuario
async function validateUser (object) {
  return userSchema.safeParseAsync(object)
}

// Función para validar un objeto de reserva
async function validateReservation (object) {
  return reservationSchema.safeParseAsync(object)
}

// Función para validar un objeto de pasajero
async function validatePassenger (object) {
  return passengerSchema.safeParseAsync(object)
}

// Exportar los esquemas y las funciones de validación
export { validateUser, validateReservation, validatePassenger }
