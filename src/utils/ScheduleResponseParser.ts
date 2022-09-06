import { ScheduleData, StationData } from '../model/api';

interface ResponseParser {
    parse: () => string
}

class ScheduleResponseParser implements ResponseParser {
  private station: StationData;

  private schedules: Array<ScheduleData>;

  constructor(station: StationData, schedules: Array<ScheduleData>) {
    this.station = station;
    this.schedules = schedules;
  }

  public parse() : string {
    return this.header() + this.body();
  }

  private header(): string {
    return `*JADWAL KRL*\nMenampilkan jadwal 3 Jam kedepan dari stasiun ${this.station.stationName}\n\n`;
  }

  private body(): string {
    return this.schedules?.map((data) => this.lineParser(data)).join('\n');
  }

  private lineParser(data: ScheduleData): string {
    return `*${this.station.stationName} - ${data.destination}*\n🕰 ${data.timeEst} - ${data.destTime}\n🚂 _${data.routeName}_\n`;
  }
}

export default ScheduleResponseParser;
