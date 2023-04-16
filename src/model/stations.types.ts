import { Model } from 'mongoose'

export interface IStation {
    stationCode: string
    stationName: string
    area: number
    status: number
}

export interface IStationMethods {}

export interface StationModel extends Model<IStation, {}, IStationMethods> {}
