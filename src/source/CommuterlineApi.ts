import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse, TrainScheduleData, StationData, ScheduleData, TimeRange,
} from '../model/api';
import logger from '../utils/logger';

export default class CommuterlineApi {
  private instance: AxiosInstance;

  private static instance: CommuterlineApi;

  private constructor() {
    const apiUrl: string = process.env.API_URL as string;

    if (apiUrl === undefined) {
      throw new Error('API_URL is not defined');
    }

    this.instance = axios.create({
      baseURL: apiUrl,
      timeout: 10000,
    });
  }

  public static getInstance(): CommuterlineApi {
    if (!this.instance) {
      this.instance = new CommuterlineApi();
    }

    return this.instance;
  }

  async getTrainSchedule(trainNum: string): Promise<Array<TrainScheduleData>> {
    logger.info(`🌐 API getTrainSchedule sending request for trainNum: ${trainNum}`);

    const response: AxiosResponse<ApiResponse<TrainScheduleData>> = await this.instance.get(`/train-schedule?trainNum=${trainNum}`);
    return response.data?.payload;
  }

  async getStations(): Promise<Array<StationData> | undefined> {
    logger.info('🌐 API getStations sending request');

    const response: AxiosResponse<ApiResponse<StationData>> = await this.instance.get('/station-list');
    return response.data.payload
      .filter((station) => station.status === 1)
      .sort((a, b) => a.stationName.localeCompare(b.stationName));
  }

  async getSchedules(stationCode: string, time: TimeRange): Promise<Array<ScheduleData>> {
    logger.info(`🌐 API getSchedules sending request for origin: ${stationCode} time: ${time.start} - ${time.end}`);

    const response: AxiosResponse<ApiResponse<ScheduleData>> = await this.instance.get(`/schedule?origin=${stationCode}&timefrom=${time.start}&timeto=${time.end}`);
    return response.data.payload;
  }
}
