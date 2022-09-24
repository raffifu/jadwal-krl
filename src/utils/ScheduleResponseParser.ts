import { ScheduleData, StationData, TimeRange } from '../model/api';

interface ResponseParser {
    parse: () => string
}

class ScheduleResponseParser implements ResponseParser {
  private station: StationData;

  private timeRange: TimeRange;

  private schedules: Array<ScheduleData>;

  constructor(station: StationData, schedules: Array<ScheduleData>, timeRange: TimeRange) {
    this.station = station;
    this.schedules = schedules;
    this.timeRange = timeRange;
  }

  public parse() : string {
    return this.header() + this.body();
  }

  private header(): string {
    return `*JADWAL KRL Commuterline*\n(${this.station.stationCode}) ${this.station.stationName}\n${this.timeRange.start} - ${this.timeRange.end}\n\n`;
  }

  private body(): string {
    if (this.schedules) { return this.schedules.map((data) => this.lineParser(data)).join('\n'); }

    return 'Tidak ada jadwal pada rentang waktu tersebut';
  }

  private lineParser(data: ScheduleData): string {
    return `*${this.station.stationName} - ${data.destination}*\n🕰 ${data.timeEst} - ${data.destTime}\n🚂 _${data.routeName}_\n`;
  }
}

export default ScheduleResponseParser;
