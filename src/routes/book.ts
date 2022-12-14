import { Router } from 'express'
import { BookController } from '../Controllers/BookController'
import { auth } from '../middlewares/autherize'

const router = Router()

router.get('/books', BookController.getBooks)

router.get('/books/genra', BookController.getBooksByGenra)
router.get('/books/author', BookController.getBooksByAuthor)
router.get('/books/title', BookController.getBooksByTitle)
router.get('/books/titleTrie', BookController.getBooksByTitleTrie)

router.get('/books/:id', auth, BookController.getBook)
router.delete('/books/:id', auth, BookController.deleteBook)
router.put('/books/:id', auth, BookController.updateBook)


export default router