const DB_URI = process.env.MONGO_URI || "mongodb+srv://client:ciB0f2JaPkCfS0uV@cluster0.dksbqbi.mongodb.net/BookDB"

const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || "secret"
const MaxAge = 1000 * 60 * 60 * 24 // 24 hours
const EMAIL = process.env.EMAIL || "email"
const PASSWORD = process.env.PASSWORD || "12345678"
const DB_USERNAME = process.env.DB_USERNAME || "client"
const DB_PASSWORD = process.env.DB_PASSWORD || "ciB0f2JaPkCfS0uV"


const configs = {
    MONGO_URI: DB_URI,
    PORT: PORT,
    JWT_SECRET: JWT_SECRET,
    MaxAge,
    EMAIL,
    PASSWORD
}

export default configs