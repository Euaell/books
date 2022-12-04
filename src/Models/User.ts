import { Schema, Document, model } from "mongoose"

// email validation
import validator from "validator"

export interface IUser extends Document {
    FirstName: string
    LastName: string
    Email: string
    Password: string
    Role: string
    DateJoined: Date
    // array of books model id
    Books: Schema.Types.ObjectId[]
    Friends: Schema.Types.ObjectId[]
    age: number
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
    age: { 
        type: Number,
        min: [12, "Age must be greater than 12"], 
        required: true 
    }
})

export default model<IUser>("User", UserSchema)