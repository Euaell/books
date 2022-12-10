import { Request, Response, NextFunction } from 'express'
import configs from '../configs/config'
import jwt from 'jsonwebtoken'
import User, { roles, IUser } from '../models/user'
import { generateToken } from '../utils/generateToken'
import { sendEmail } from '../utils/sendEmail'
import { hashPassword, comparePassword } from '../utils/hashPassword'
import { IUnverifiedUser } from '../Models/UnVerifiedUser'
import mongoose from 'mongoose'
import { IBook } from '../Models/Book'

// TODO: send email to user to verify email

export class UserController {
    public static async register(req: Request, res: Response) {
        const { FirstName, LastName, Password, dateofbirth } = req.body

        try {
            const verifiedToken = req.headers['verified-user-token'] as string || req.body.verifiedUserToken || req.query.verifiedUserToken || req.cookies.verifiedUserToken 
            if (!verifiedToken)
                return res.status(401).json({ message: 'No token, authorization denied' })
            
            const { Email, DateCreated } = jwt.verify(verifiedToken, configs.JWT_SECRET) as IUnverifiedUser
            
            let user = await User.findOne({ Email })

            if (user) 
                return res.status(400).json({ message: 'User already exists' })
            
            user = await User.create({
                FirstName,
                LastName,
                Email,
                Password: await hashPassword(Password),
                DOB: dateofbirth,
                DateJoined: DateCreated,
            })

            const token = generateToken({ id: user.id })
            
            res.cookie('userToken', token, { httpOnly: true, maxAge: configs.MaxAge })
            
            res.clearCookie('verifiedUserToken')

            await sendEmail(
                Email, 
                `Welcome ${FirstName} ${LastName} to this amazing platform for readers. You can find books that interest you and read. If you don't find any books that might interest you, please contribute by uploading it so that other's with the same interest as you can find them. <br />
                You will also be able to find other readers and connect with them. And get a reading suggestion based on your reading history and the books your friends have read.<br /><br />

                Please enjoy and Thank you for joining us.`, 
                `Welcome, ${FirstName}`, 
                'Welcome to the club!'
                )

            res.status(200).json({ user })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async login(req: Request, res: Response) {
        const { Email, Password } = req.body

        try {
            let user = await User.findOne({ Email })

            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' })
            }
            
            const isMatch = await comparePassword(Password, user.Password)
            
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' })
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            const token = generateToken(payload.user)
            res.cookie('userToken', token, { httpOnly: true, maxAge: configs.MaxAge })

            res.status(200).json({ user })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async me(req: Request, res: Response) {
        try {
            const user = req.body.user
            // populate books and friends with their data
            // with the exception of the password
            const me = await User.findById(user.id)
                                .populate('Books')
                                // populate friends with their data except password
                                .populate({
                                    path: 'Friends',
                                    select: '-Password -Role -DateJoined -DOB -DateCreated -Friends',
                                    // populate: {
                                    //     path: 'Books',
                                    //     select: '-Password'
                                    // }
                                })
                                .select('-Password')
            
            res.status(200).json({user: me})
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async logout(req: Request, res: Response) {
        try {
            res.clearCookie('userToken')
            res.status(200).json({ message: 'Logged out' })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async getUsers(req: Request, res: Response) {
        try {
            const users = await User.find().select('-Password')

            res.status(200).json(users)
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async getUser(req: Request, res: Response) {
        try {
            const user = await User.findById(req.params.id).select('-Password')

            res.status(200).json(user)
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async updateUser(req: Request, res: Response) {
        try {
            const user = await User.findByIdAndUpdate( req.params.id, req.body, { new: true }).select('-Password') as IUser 

            res.status(200).json(user)
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async deleteUser(req: Request, res: Response) {
        try {
            await User.findByIdAndDelete(req.params.id)

            res.status(200).json({ message: 'User deleted' })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async makeAdmin(req: Request, res: Response) {
        try {
            const admin = req.body.user

            if (admin.Role !== roles.admin) {
                return res.status(401).json({ message: 'Unauthorized' })
            }
            const user = await User.findByIdAndUpdate(req.params.id, { Role: roles.admin }, { new: true }).select('-Password') as IUser

            res.status(200).json(user)
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    // add friend
    public static async addFriend(req: Request, res: Response) {
        try {
            const user = req.body.user
            // get friend id as mongoose id
            const friedId = new mongoose.Types.ObjectId(req.body.friendId)

            // find friend
            const friend = await User.findById(friedId).select('-Password') as IUser
            
            if (!friend)
                return res.status(400).json({ message: 'User not found' })

            let friendHasUser = friend.Friends.includes(user.id)
            let userHasFriend = user.Friends.includes(friend.id)

            // already friends
            if (friendHasUser && userHasFriend || friend.id === user.id) {
                return res.status(400).json({ message: 'User is already a friend' })
            }

            // two conditions to add friend
            // send request
            if (!friendHasUser && !userHasFriend) {
                friend.Friends.push(user.id)
                await User.findByIdAndUpdate(friend.id, { Friends: friend.Friends })

                return res.status(200).json({ message: 'Friend request sent' })
            }

            // accept request
            if (!friendHasUser && userHasFriend) {
                friend.Friends.push(user.id)
                await User.findByIdAndUpdate(friend.id, { Friends: friend.Friends })

                return res.status(200).json({ message: 'Friend request accepted' })
            }

            // already requested
            if (friendHasUser && !userHasFriend) {
                return res.status(400).json({ message: 'Friend request already sent' })
            }

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    // remove friend
    public static async removeFriend(req: Request, res: Response) {
        try {
            const user = req.body.user
            const friend = await User.findById(req.params.id) as IUser

            if (!friend) {
                return res.status(400).json({ message: 'User not found' })
            }

            let friendHasUser = friend.Friends.includes(user.id)
            let userHasFriend = user.Friends.includes(friend.id)

            // not friends
            if (!friendHasUser && !userHasFriend) {
                return res.status(400).json({ message: 'User is not a friend' })
            }

            // two conditions to remove friend
            // cancel request
            if (friendHasUser && !userHasFriend) {
                friend.Friends = friend.Friends.filter(f => f != user.id)
                await friend.save()

                return res.status(200).json({ message: 'Friend request cancelled' })
            }

            // remove friend
            if (!friendHasUser && userHasFriend) {
                user.Friends = user.Friends.filter(f => f != friend.id)
                await user.save()
                friend.Friends = friend.Friends.filter(f => f != user.id)
                await friend.save()

                return res.status(200).json({ message: 'Friend removed' })
            }

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    // get friends
    public static async getFriends(req: Request, res: Response) {
        try {
            const user = req.body.user
            const all = await User.find({ _id: { $in: user.Friends } }).select('-Password')

            // if 
            const friends = all.filter(f => f.Friends.includes(user.id))

            res.status(200).json({ friends })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    // TODO: get friend requests
    public static async getFriendRequests(req: Request, res: Response) {
        try {
            const user = req.body.user
            const all = await User.find({ _id: { $in: user.Friends } }).select('-Password')

            const requests = all.filter(f => !f.Friends.includes(user.id))

            res.status(200).json({ requests })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    // get friend suggestions
    public static async getFriendSuggestions(req: Request, res: Response) {
        try {
            const user = req.body.user
            const all = await User.find({ _id: { $nin: user.Friends } }).select('-Password')

            const suggestions = all.filter(f => !f.Friends.includes(user.id))

            res.status(200).json({ suggestions })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    // get friend suggestions by the books they read similar to the user
    public static async getFriendSuggestionsByBooks(req: Request, res: Response) {
        // TODO: implement this
    }

    // get the books the user is read
    public static async getBooks(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.body.user
            req.body.bookIds = user.Books
            
            return next()

        } catch (err) {
            console.error(err.message)
            return res.status(500).send({ message: err.message })
        }
    }

    // add book
    public static async addBook(req: Request, res: Response) {
        try {
            const { user, book: { id } } = req.body as { book: IBook
            user: IUser }
            
            // const { id } = req.body.book as IBook   

            if (!id) {
                return res.status(400).json({ message: 'Book not found' })
            }

            // check if book is already added
            if (user.Books.includes(id)) {
                return res.status(400).json({ message: 'Book already added' })
            }
            
            user.Books.push(id)
            await User.findByIdAndUpdate(user.id, { Books: user.Books })

            res.status(200).json({ message: 'Book added' }) 

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    public static async addBookById(req: Request, res: Response) {
        try {  
            const { user, book } = req.body

            if (!book) {
                return res.status(400).json({ message: 'Book not found' })
            }

            // check if book is already added
            if (user.Books.includes(book.id)) {
                return res.status(400).json({ message: 'Book already added' })
            }
            
            await User.findByIdAndUpdate(user.id, { $push: { Books: book.id } }, { new: true })

            res.status(200).json({ message: 'Book added' })

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

    // remove book
    public static async removeBook(req: Request, res: Response) {
        try {
            const { user, book } = req.body

            if (!book) {
                return res.status(400).json({ message: 'Book not found' })
            }

            await User.findByIdAndUpdate(user.id, { $pull: { Books: book.id } }, { new: true })

            res.status(200).json({ message: 'Book removed' })

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }

    }
    
    // get book suggestions
    public static async getBookSuggestions(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.body.user
            let readBooks = new Set(
                user.Books.map((b: mongoose.Types.ObjectId) => b.toString())
            )
            let suggestions = new Set()

            // get all books friends read
            const friends = await User.find({ _id: { $in: user.Friends } }).select("-Password -Friends -_id -Email -FirstName -LastName -Role -DateJoined -DOB")
            friends.forEach(f => {
                f.Books.forEach(b => {
                    if (!readBooks.has(b.toString())) {
                        suggestions.add(b.toString())
                    }
                })
            })

            req.body.bookIds = Array.from(suggestions)
            
            next()

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ message: err.message })
        }
    }

}
