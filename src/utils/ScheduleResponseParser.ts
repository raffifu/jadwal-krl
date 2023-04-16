import { ScheduleData, StationData, TimeRange } from '../model/api'
import ResponseParser from './ResponseParser.interface'

class SchedulesParser implements ResponseParser {
  private station: StationData

  private timeRange: TimeRange

  private schedules: Array<ScheduleData>

  constructor (station: StationData, schedules: Array<ScheduleData>, timeRange: TimeRange) {
    this.station = station
    this.schedules = schedules
    this.timeRange = timeRange
  }

  public parse () : string {
    return this.header() + this.body()
  }

  private header (): string {
    return `*JADWAL KRL Commuterline*\n(${this.station.stationCode}) ${this.station.stationName}\n${this.timeRange.start} - ${this.timeRange.end}\n\n`
  }

  private body (): string {
    if (this.schedules) {
      let totalLength: number = this.header.length
      return this.schedules.map((data) => {
        const lineParsed = this.lineParser(data)
        totalLength += lineParsed.length

        return totalLength < 4096 ? lineParsed : null
      }).join('\n')
    }

    return 'Tidak ada jadwal pada rentang waktu tersebut'
  }

  private lineParser (data: ScheduleData): string {
    return `/jadwal\\_${data.trainNum}\n*${this.station.stationName} - ${data.destination}*\n🕰 ${data.timeEst} - ${data.destTime}\n🚂 _${data.trainName}_\n`
  }
}

export default SchedulesParser
