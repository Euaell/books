import express, { Application, Request, Response } from 'express'

import cors from 'cors'
import cookieParser from 'cookie-parser'
// import morgan from 'morgan'
// import expressupload from 'express-fileupload'

// import routes
import userRoutes from './routes/user'
import bookRoutes from './routes/book'

const app: Application = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
// app.use(expressupload())
app.use(cors())

// app.use(morgan('dev'))

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})

app.use('/api/user', userRoutes)
app.use('/api/book', bookRoutes)

export default app
