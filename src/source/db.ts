import { Db, MongoClient } from 'mongodb';
import logger from '../utils/logger';

export default class MongoDbConnection {
  private static instance: MongoDbConnection;

  private client: MongoClient;

  private constructor() {
    const mongoUrl: string = process.env.MONGODB_URL as string;

    if (mongoUrl === undefined) {
      throw new Error('MONGODB_URL is not defined');
    }

    this.client = new MongoClient(mongoUrl);

    this.client.connect()
      .then(() => {
        logger.info('🗄️  DATABASE Connection success');
      })
      .catch((err) => {
        logger.error(`🗄️  DATABASE Connection failed. ${err}`);
      });
  }

  public static getInstance(): Db {
    if (!this.instance) {
      this.instance = new MongoDbConnection();
    }
    return this.instance.client.db(process.env.DB_NAME);
  }
}
