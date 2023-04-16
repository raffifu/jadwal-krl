import { Schema } from 'mongoose'
import { IStation, IStationMethods, StationModel } from './stations.types'

const StationSchema = new Schema<IStation, StationModel, IStationMethods>({
  stationCode: { type: String, required: true },
  stationName: {
    type: String, required: true, index: true, unique: true
  },
  area: { type: Number, required: true },
  status: { type: Number, required: true }
})

export default StationSchema
