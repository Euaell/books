import { Request, Response } from 'express';
import configs from '../configs/config';

import UnVerifiedUser from '../Models/UnVerifiedUser';
import { generateToken } from '../utils/generateToken';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import { sendEmail } from '../utils/sendEmail';

export class UnverifiedUserController {

    public static async register(req: Request, res: Response) {
        try {
            const { Email } = req.body

            const user = await UnVerifiedUser.findOne({ Email })

            if (user) {
                if (user.Verified)
                    return res.status(400).json({
                         message: 'User already exists',
                         goto: '/login'
                     })
                else
                    return res.status(400).json({ 
                        message: 'User already exists, if you have not recieved an email, please click on resend',
                        goto: '/resend'
                    })
            }

            const OTP = Math.floor(100000 + Math.random() * 900000).toString()

            const newUnverifiedUser = await UnVerifiedUser.create({
                Email,
                OTP: await hashPassword(OTP),
            })

            const token = generateToken({
                id: newUnverifiedUser._id,
            })
            
            await sendEmail(Email, OTP, 'Verify your email by entering the code below', 'Verify your email')
            
            res.cookie("UnverifiedUserToken", token, { httpOnly: true, maxAge: configs.MaxAge })

            res.status(200).json({
                message: 'Please verify your email',                
            })
        } catch (err) {
            console.error(err.message)
            res.status(500).json({ msg: err.message })
        }
    }

    public static async verify(req: Request, res: Response) {
        try {
            const { OTP } = req.body
            const unVerifiedUser = req.body.unverifiedUser

            // compare the OTP with the one in the database
            const isMatch = await comparePassword(OTP, unVerifiedUser.OTP)
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid OTP' })
            }
            

            const token = generateToken({
                Email: unVerifiedUser.Email,
                DateCreated: unVerifiedUser.DateCreated,
            })

            await UnVerifiedUser.findOneAndUpdate({ Email: unVerifiedUser.Email }, { Verified: true })

            res.cookie("verifiedUserToken", token, { httpOnly: true, maxAge: configs.MaxAge })
            res.clearCookie("UnverifiedUserToken")

            res.status(200).json({ message: 'User verified' })

        } catch (err) {
            console.error(err.message)
            res.status(500).json({ msg: err.message })
        }
    }

    public static async resend(req: Request, res: Response) {
        try {
            const unVerifiedUser = req.body.unverifiedUser

            const OTP = Math.floor(100000 + Math.random() * 900000).toString()

            await UnVerifiedUser.findOneAndUpdate({ Email: unVerifiedUser.Email }, { OTP })

            await sendEmail(unVerifiedUser.Email, OTP, 'Verify your email by entering the code below', 'Verify your email')

            res.status(200).json({ message: 'Email sent' })
        } catch (err) {
            console.error(err.message)
            res.status(500).json({ message: err.message })
        }
    }

}

