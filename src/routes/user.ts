import { Router } from 'express'
import { BookController } from '../Controllers/BookController'
import { UserController } from '../Controllers/UserController'
import { auth } from '../middlewares/autherize'

const router = Router()

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/me', auth, UserController.me)
router.get('/logout', auth, UserController.logout)

router.get('/getBooks', auth, UserController.getBooks, BookController.getBooksByIds)
router.get('/getBooksuggestion', auth, UserController.getBookSuggestions, BookController.getBooksByIds)
router.post('/addBook', auth, BookController.createBook, UserController.addBook)
router.post('/addBookById', auth, BookController.getBook, UserController.addBookById)
router.delete('/removeBook', auth, UserController.removeBook)

router.get('/getfriends', auth, UserController.getFriends)
router.get('/getfriendrequests', auth, UserController.getFriendRequests)
router.post('/addfriend', auth, UserController.addFriend)
router.delete('/removefriend', auth, UserController.removeFriend)

router.get('/users', UserController.getUsers)
router.get('/users/:id', UserController.getUser)
router.put('/users/:id', UserController.updateUser)
router.delete('/users/:id', UserController.deleteUser)

router.put('/users/makeAdmin/:id', auth, UserController.makeAdmin)

export default router