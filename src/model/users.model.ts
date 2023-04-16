import { model } from 'mongoose'
import { UserSchema } from './users.schema'
import { IUser, UserModel } from './users.types'

const User = model<IUser, UserModel>('User', UserSchema)

export default User
