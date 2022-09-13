import { HydratedDocument, Model } from 'mongoose';
import { StationData } from './api';

export interface IUser {
    chatId: number;
    station?: StationData;
}

export interface IUserMethods {
    setStation(station: StationData): void;
}

export interface UserModel extends Model<IUser, {}, IUserMethods> {
    findOneOrCreate(chatId: number): Promise<HydratedDocument<IUser, IUserMethods>>;
}
