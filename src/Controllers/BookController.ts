import { NextFunction, Request, Response } from 'express'

import Book, { IBook } from '../Models/Book'

export class BookController {
    public static async createBook(req: Request, res: Response, next: NextFunction) {
        
        try {
            let { Title } = req.body
            Title = Title.toUpperCase()
            
            let book = await Book.findOne({ Title })
            if (book) {
                return res.status(200).json({ book })
            }

            const bookFields: IBook = req.body            
            let newBook = await Book.create(bookFields)

            req.body.book = newBook

            next()

            // res.status(200).json({ newBook })

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async getBooks(req: Request, res: Response) {
        try {
            const books = await Book.find()

            res.status(200).json({ books })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async getBook(req: Request, res: Response, next: NextFunction) {
        try {
            const book = await Book.findById(req.body.bookId)

            if (!book) {
                return res.status(404).json({ message: 'Book not found' })
            }
            req.body.book = book
            res.status(200).json({ book })
            next()
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async getBooksByIds(req: Request, res: Response, next: NextFunction) {
        try {
            const { bookIds } = req.body
            const books = await Book.find({ _id: { $in: bookIds } })

            res.status(200).json({ books })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async getBooksByGenra(req: Request, res: Response) {
        try {
            // pass array of genra to filter
            // genra is an array of strings
            const genra = req.body.genra
            
            // search for books by genra in every word in the genra array
            const books = await Book.find({ Genra: { $in: genra } })
            
            res.status(200).json({ books })
            
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async getBooksByTitle(req: Request, res: Response) {
        try {
            const Title = req.body.title.toUpperCase().trim()
            
            const books = await Book.find({ Title: Title })
            console.log(books)
            if (!books) {
                return res.status(404).json({ message: ` Book with ${Title} not found` })
            }


            res.status(200).json({ books })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async getBooksByTitleTrie(req: Request, res: Response) {
        try {
            const Title = req.body.title.toUpperCase().trim()

            const books = await Book.find({ Title: { $regex: Title } })

            if (!books) {
                return res.status(404).json({ message: ` Book with ${Title} not found` })
            }

            res.status(200).json({ books })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async getBooksByAuthor(req: Request, res: Response) {
        try {
            const author = req.body.author
            // map through the array of authors to uppercase each author
            const authors = author.map((author: string) => author.toUpperCase().trim())
            
            const books = await Book.find({ Author: { $in: authors } })

            res.status(200).json({ books })

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async deleteBook(req: Request, res: Response) {
        try {
            const book = await Book.findById(req.params.id)

            if (!book) {
                return res.status(404).json({ message: 'Book not found' })
            }

            await book.remove()

            res.status(200).json({ message: 'Book removed' })

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async updateBook(req: Request, res: Response) {
        // const { title, genra } = req.body

        const bookFields: IBook = req.body

        // if (title) bookFields.title = title
        // if (genra) bookFields.genra = genra

        try {
            let book = await Book.findById(req.params.id)

            if (!book) {
                return res.status(404).json({ message: 'Book not found' })
            }

            let updatedBook = await Book.findByIdAndUpdate(req.params.id, { $set: bookFields }, { new: true })
            
            res.status(200).json({ updatedBook })

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }
}


