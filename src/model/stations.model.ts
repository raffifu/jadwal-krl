import { model } from 'mongoose';
import StationSchema from './stations.schema';
import { IStation, StationModel } from './stations.types';

const Station = model<IStation, StationModel>('station', StationSchema);

export default Station;
