import { Request, Response, NextFunction } from 'express'

import User, { roles, IUser } from '../models/user'
import { generateToken } from '../utils/generateToken'
// import { sendEmail } from '../utils/sendEmail'
import { hashPassword, comparePassword } from '../utils/hashPassword'

// TODO: send email to user to verify email

export class UserController {
    public static async register(req: Request, res: Response) {
        const { FirstName, LastName, Email, Password, age } = req.body

        try {
            let user = await User.findOne({ Email })

            if (user) {
                return res.status(400).json({ msg: 'User already exists' })
            }

            user = new User({
                FirstName,
                LastName,
                Email,
                Password: await hashPassword(Password),
                age
            })

            await user.save()

            const payload = {
                user: {
                    id: user.id
                }
            }

            generateToken(payload, res)

            res.status(200).json({ user })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }
    }

    public static async login(req: Request, res: Response) {
        const { Email, Password } = req.body

        try {
            let user = await User.findOne({ Email })

            if (!user) {
                return res.status(400).json({ msg: 'Invalid credentials' })
            }
            
            const isMatch = await comparePassword(Password, user.Password)
            
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials' })
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            generateToken(payload.user, res)

            res.status(200).json({ user })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }
    }

    public static async me(req: Request, res: Response) {
        try {
            const user = req.body.user
            // populate books and friends with their data
            const me = await User.findById(user.id).populate('Books').populate('Friends').select('-Password') as IUser

            res.status(200).json({user: me})
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }
    }

    public static async logout(req: Request, res: Response) {
        try {
            res.clearCookie('userToken')
            res.status(200).json({ msg: 'Logged out' })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }
    }

    public static async getUsers(req: Request, res: Response) {
        try {
            const users = await User.find().select('-Password')

            res.status(200).json(users)
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }
    }

    public static async getUser(req: Request, res: Response) {
        try {
            const user = await User.findById(req.params.id).select('-Password')

            res.status(200).json(user)
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }
    }

    public static async updateUser(req: Request, res: Response) {
        try {
            const user = await User.findByIdAndUpdate( req.params.id, req.body, { new: true }).select('-Password') as IUser 

            res.status(200).json(user)
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }
    }

    public static async deleteUser(req: Request, res: Response) {
        try {
            await User.findByIdAndDelete(req.params.id)

            res.status(200).json({ msg: 'User deleted' })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }
    }

    public static async makeAdmin(req: Request, res: Response) {
        try {
            const admin = req.body.user

            if (admin.Role !== roles.admin) {
                return res.status(401).json({ msg: 'Unauthorized' })
            }
            const user = await User.findByIdAndUpdate(req.params.id, { Role: roles.admin }, { new: true }).select('-Password') as IUser

            res.status(200).json(user)
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }
    }

    // add friend
    public static async addFriend(req: Request, res: Response) {
        try {
            const user = req.body.user
            const friend = await User.findById(req.body.friendId) as IUser

            if (!friend) {
                return res.status(400).json({ msg: 'User not found' })
            }

            let friendHasUser = friend.Friends.includes(user.id)
            let userHasFriend = user.Friends.includes(friend.id)

            // already friends
            if (friendHasUser && userHasFriend) {
                return res.status(400).json({ msg: 'User is already a friend' })
            }

            // two conditions to add friend
            // send request
            if (!friendHasUser && !userHasFriend) {
                friend.Friends.push(user.id)
                await friend.save()

                return res.status(200).json({ msg: 'Friend request sent' })
            }

            // accept request
            if (friendHasUser && !userHasFriend) {
                user.Friends.push(friend.id)
                await user.save()

                return res.status(200).json({ msg: 'Friend request accepted' })
            }

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }
    }

    // remove friend
    public static async removeFriend(req: Request, res: Response) {
        try {
            const user = req.body.user
            const friend = await User.findById(req.params.id) as IUser

            if (!friend) {
                return res.status(400).json({ msg: 'User not found' })
            }

            let friendHasUser = friend.Friends.includes(user.id)
            let userHasFriend = user.Friends.includes(friend.id)

            // not friends
            if (!friendHasUser && !userHasFriend) {
                return res.status(400).json({ msg: 'User is not a friend' })
            }

            // two conditions to remove friend
            // cancel request
            if (friendHasUser && !userHasFriend) {
                friend.Friends = friend.Friends.filter(f => f != user.id)
                await friend.save()

                return res.status(200).json({ msg: 'Friend request cancelled' })
            }

            // remove friend
            if (!friendHasUser && userHasFriend) {
                user.Friends = user.Friends.filter(f => f != friend.id)
                await user.save()
                friend.Friends = friend.Friends.filter(f => f != user.id)
                await friend.save()

                return res.status(200).json({ msg: 'Friend removed' })
            }

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
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
            res.status(500).send({ msg: err.message })
        }
    }

    // get friend requests
    public static async getFriendRequests(req: Request, res: Response) {
        try {
            const user = req.body.user
            const all = await User.find({ _id: { $in: user.Friends } }).select('-Password')

            const requests = all.filter(f => !f.Friends.includes(user.id))

            res.status(200).json({ requests })
        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
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
            res.status(500).send({ msg: err.message })
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
            return res.status(500).send({ msg: err.message })
        }
    }

    // add book
    public static async addBook(req: Request, res: Response) {
        try {
            const user = req.body.user
            const bookId = req.body.book

            if (!bookId) {
                return res.status(400).json({ msg: 'Book not found' })
            }
            
            await User.findByIdAndUpdate(user.id, { $push: { Books: bookId } }, { new: true })

            res.status(200).json({ msg: 'Book added' }) 

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }
    }

    // remove book
    public static async removeBook(req: Request, res: Response) {
        try {
            const user = req.body.user
            const bookId = req.body.book

            if (!bookId) {
                return res.status(400).json({ msg: 'Book not found' })
            }

            await User.findByIdAndUpdate(user.id, { $pull: { Books: bookId } }, { new: true })

            res.status(200).json({ msg: 'Book removed' })

        } catch (err) {
            console.error(err.message)
            res.status(500).send({ msg: err.message })
        }

    }
        

}
