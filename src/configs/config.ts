import dotenv from 'dotenv'
dotenv.config()

const DB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/BookDB"

const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || "secret"
const MaxAge = 1000 * 60 * 60 * 24 // 24 hours
const EMAIL = process.env.EMAIL || "email"
const PASSWORD = process.env.PASSWORD || "12345678"

const DB_USERNAME = process.env.DB_USERNAME || "username"
const DB_PASSWORD = process.env.DB_PASSWORD || "password"


const configs = {
    MONGO_URI: DB_URI,
    PORT: PORT,
    JWT_SECRET: JWT_SECRET,
    MaxAge,
    EMAIL,
    PASSWORD
}

export default configs