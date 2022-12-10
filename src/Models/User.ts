import { Schema, Document, model } from "mongoose"

// email validation
import validator from "validator"

// TODO: add a field for profile picture
// TODO: add a field for bio
// TODO: add a feature for users to choose the level of privacy they want (public, private, friends only)

export interface IUser extends Document {
    FirstName: string
    LastName: string
    Email: string
    Password: string
    Role: string
    DateJoined: Date
    Books: Schema.Types.ObjectId[]
    Friends: Schema.Types.ObjectId[]
    DOB: Date
}

export enum roles {
    admin = "ADMIN",
    user = "user"
}

const emailValidator = (email: string) => {
    return validator.isEmail(email)
}

const UserSchema: Schema<IUser> = new Schema({
    FirstName: { 
        type: String,
        set: (val: string) => val.toUpperCase().trim(), 
        required: true 
    },
    LastName: { 
        type: String,
        set: (val: string) => val.toUpperCase().trim(), 
        required: true 
    },
    Email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true,
        maxlength: [255, "Email must be less than 255 characters long"],
        validate: {
            validator: emailValidator,
            message: (props: any) => `"${props.value}" is not a valid email address!`
        }
    },
    Password: { 
        type: String,
        minlength: [6, "Email must be at least 6 characters long"], 
        required: true 
    },
    Role: { type: String, default: roles.user, required: true },
    DateJoined: { type: Date, default: Date.now, required: true},
    Books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
    Friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    DOB: { 
        type: Date,
        validate: {
            validator: (val: Date) => {
                // check if date is less than 18 years ago
                return Date.now() - val.getTime() >= 1000 * 60 * 60 * 24 * 365 * 18
            },
            message: (props: any) => `"${props.value}" is not a valid date!`
        },
        required: true 
    }
})

export default model<IUser>("User", UserSchema)