import { Schema, Document, model } from 'mongoose'

export interface IBook extends Document {
    Sequence: string
    Title: string
    Genra: [string]
    Author: string
    DatePublished: Date
    ReadCount: number
}

export enum genras {
    Fantasy = 'FANTASY',
    SciFi = 'SCIFI',
    Romance = 'ROMANCE',
    Mystery = 'MYSTERY',
    Thriller = 'THRILLER',
    NonFiction = 'NON-FICTION',
    Fiction = 'FICTION',
    Other = 'OTHER'
}

const BookSchema: Schema<IBook> = new Schema({
    Sequence: {
        type: String,
        default: 'SAN', // Stand alone novel
        set: (val: string) => val.toUpperCase().trim(),
        required: false
    },
    Title: { 
        type: String, 
        set: (val: string) => val.toUpperCase().trim(),
        required: true 
    },
    Genra: { 
        type: [String],
        // enum: Object.values(genras),
        default: [genras.Other], 
        required: true 
    },
    Author: { 
        type: String, 
        default: "Unknown",
        // capitalize the entire string
        set: (v: string) => v.toUpperCase().trim(),
        required: true
    },
    DatePublished: { type: Date, default: Date.now, required: true },
    ReadCount: { type: Number, default: 1, required: true }
})


export default model<IBook>('Book', BookSchema)
