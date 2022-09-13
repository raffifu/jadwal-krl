import { HydratedDocument, Schema } from 'mongoose';
import { IUser, UserModel, IUserMethods } from './users.types';
import { StationData } from './api';

export const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  chatId: { type: Number, required: true },
  station: { type: Object, required: false },
});

UserSchema.method('setStation', async function setStation(station: StationData): Promise<void> {
  this.station = station;
  await this.save();
});

UserSchema.static('findOneOrCreate', async function findOneOrCreate(chatId: number, station?: StationData): Promise<HydratedDocument<IUser, IUserMethods>> {
  const user = await this.findOne({ chatId });
  if (user) return user;
  return this.create({ chatId, station });
});
