import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

export interface IUnverifiedUser extends Document {
    Email: string
    OTP: string
    DateCreated: Date
    Verified: boolean
}

const UnverifiedUserSchema: Schema = new Schema({
    Email: {
        type: String,
        required: true,
        validate: {
            validator: validator.isEmail,
            message: (props: any) => `"${props.value}" is not a valid email address!`,
        },
        unique: true,
    },
    OTP: {
        type: String,
        required: true,
    },
    DateCreated: {
        type: Date,
        default: Date.now,
        required: true,
    },
    Verified: {
        type: Boolean,
        default: false,
        required: true,
    },
});

export default model<IUnverifiedUser>('UnverifiedUser', UnverifiedUserSchema);