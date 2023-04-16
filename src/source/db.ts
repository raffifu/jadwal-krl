import * as Mongoose from 'mongoose'
import logger from '../utils/logger'

export default class MongoDbConnection {
  private mongoUrl: string

  private static instance: MongoDbConnection

  private constructor () {
    this.mongoUrl = process.env.MONGODB_URL as string

    if (this.mongoUrl === undefined) {
      throw new Error('MONGODB_URL is not defined')
    }

    this.connect()
  }

  public static getInstance (): MongoDbConnection {
    if (!this.instance) {
      this.instance = new MongoDbConnection()
    }

    return this.instance
  }

  private connect (): void {
    if (!Mongoose.connection) {
      Mongoose.connect(this.mongoUrl, { dbName: process.env.DB_NAME })
        .then(() => {
          logger.info('🗄️  DATABASE Connection success')
        }).catch((err) => {
          logger.error(`🗄️  DATABASE Connection failed. ${err}`)
        })
    }
  }

  public disconnect (): void {
    if (Mongoose.connection) {
      Mongoose.disconnect()
    }
  }
}
