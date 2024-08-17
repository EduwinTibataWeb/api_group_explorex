// config/dbConnection.js
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE
}

const pool = mysql.createPool(config)

const connectToDatabase = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('Conexión a la base de datos exitosa')
    return connection
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message)
    throw error
  }
}

export default connectToDatabase
