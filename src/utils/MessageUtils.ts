import { TimeRange } from '../model/api'

class MessageUtils {
  private message

  constructor (message: string) {
    this.message = message
  }

  getTime (): TimeRange | null {
    const times : RegExpMatchArray | null = this.message.match(/([0-1]?[0-9]|2[0-3]):[0-5][0-9]/g)

    if (!times) return null

    return {
      start: times[0],
      end: times[1]
    }
  }

  getStationCode (): string | null {
    const stations: RegExpMatchArray | null = this.message.match(/\(\w+\)/)

    if (!stations) { return null }

    return stations[0].substring(1, stations[0].length - 1)
  }
}

export default MessageUtils
