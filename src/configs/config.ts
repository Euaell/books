const DB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/BookDB"
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || "secret"
const MaxAge = 1000 * 60 * 60 * 24 // 24 hours
const EMAIL = process.env.EMAIL || "euaelesh@gmail.com"
const PASSWORD = process.env.PASSWORD || "12345678"


const configs = {
    MONGO_URI: DB_URI,
    PORT: PORT,
    JWT_SECRET: JWT_SECRET,
    MaxAge,
    EMAIL,
    PASSWORD
}

export default configs