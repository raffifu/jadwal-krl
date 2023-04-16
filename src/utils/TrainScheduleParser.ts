import { TrainScheduleData } from '../model/api'
import ResponseParser from './ResponseParser.interface'

class TrainScheduleParser implements ResponseParser {
  private trainSchedule: Array<TrainScheduleData>

  public constructor (trainSchedule: Array<TrainScheduleData>) {
    this.trainSchedule = trainSchedule
  }

  public parse () : string {
    return this.header() + this.body()
  }

  private header (): string {
    return '*JADWAL KRL Commuterline*\n\n'
  }

  private body (): string {
    if (this.trainSchedule) { return this.trainSchedule.map((data) => this.lineParser(data)).join('\n') }

    return 'Detail perjalanan tidak ditemukan'
  }

  private lineParser (data: TrainScheduleData): string {
    const icon = data.transitStation ? '🟠' : '🔵'

    return `${icon} ${data.timeEst.substring(0, 5)} - ${data.stationName}\n`
  }
}

export default TrainScheduleParser
