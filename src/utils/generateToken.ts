import jwt from 'jsonwebtoken'
import configs from '../configs/config'

export const generateToken = (payload: any) => {
    const token = jwt.sign(payload, configs.JWT_SECRET, { expiresIn: 360000 })
    return token
}
