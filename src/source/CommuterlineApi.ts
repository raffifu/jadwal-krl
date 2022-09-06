import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse, TrainScheduleData, StationData, ScheduleData, TimeRange,
} from '../model/api';

export default class CommuterlineApi {
  private instance: AxiosInstance;

  constructor(url: string) {
    this.instance = axios.create({
      baseURL: url,
      timeout: 10000,
    });
  }

  async getTrainSchedule(trainNum: number): Promise<Array<TrainScheduleData>> {
    const response: AxiosResponse<ApiResponse<TrainScheduleData>> = await this.instance.get(`/train-schedule?trainNum=${trainNum}`);
    return response.data.payload;
  }

  async getStations(): Promise<Array<StationData>> {
    const response: AxiosResponse<ApiResponse<StationData>> = await this.instance.get('/station-list');
    return response.data.payload
      .filter((station) => station.status === 1)
      .sort((a, b) => a.stationName.localeCompare(b.stationName));
  }

  async getSchedules(stationCode: string, time: TimeRange): Promise<Array<ScheduleData>> {
    const response: AxiosResponse<ApiResponse<ScheduleData>> = await this.instance.get(`/schedule?origin=${stationCode}&timefrom=${time.start}&timeto=${time.end}`);
    return response.data.payload;
  }
}
