import { Request, Response, NextFunction } from 'express'
import User, { IUser } from '../models/user'
import jwt from 'jsonwebtoken'
import UnVerifiedUser, { IUnverifiedUser } from '../Models/UnVerifiedUser'

const jwtSecret = 'secret'

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['user-token'] as string || req.body.userToken || req.query.userToken || req.cookies.userToken

        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' })
        }

        const decoded = jwt.verify(token, jwtSecret) as IUser

        const user = await User.findById(decoded.id).select('-Password')

        if (!user) {
            return res.status(401).json({ msg: 'Token is not valid' })
        }

        req.body.user = user

        next()
    } catch (err) {
        console.error(err.message)
        res.status(500).send({ msg: err.message })
    }
}

export const authUnverifiedUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const token = req.headers['unverified-user-token'] as string || req.body.unverifiedUserToken || req.query.unverifiedUserToken || req.cookies.UnverifiedUserToken

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' })
        }

        const decoded = jwt.verify(token, jwtSecret) as IUnverifiedUser
        
        const user = await UnVerifiedUser.findById(decoded.id)

        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' })
        }

        req.body.unverifiedUser = user

        next()

    } catch (err) {
        console.error(err.message)
        res.status(500).send({ msg: err.message })
    }
}
