import { Response } from 'express'
import jwt from 'jsonwebtoken'
import configs from '../configs/config'

export const generateToken = (payload: any, res: Response) => {
    const token = jwt.sign(payload, configs.JWT_SECRET, { expiresIn: 360000 })
    res.cookie('userToken', token, { httpOnly: true, maxAge: configs.MaxAge })
    return token
}
