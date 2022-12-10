import nodemailer from 'nodemailer';
import configs from '../configs/config';

export const sendEmail = async (to: string, msg: string, txt: string, subject: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: configs.EMAIL,
            pass: configs.PASSWORD
        }
    })

    const mailOptions = {
        from: configs.EMAIL,
        to: to,
        subject: subject,
        html: `
        <h2>${txt}</h2>
        <p>${msg}</p>
        `
    }

    await transporter.sendMail(mailOptions)
}