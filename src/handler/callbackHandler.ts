import { Telegraf } from 'telegraf'
import { callbackQuery } from 'telegraf/filters'
import moment from 'moment-timezone'
import { StationData, TimeRange } from '../model/api'
import MessageUtils from '../utils/MessageUtils'
import CommuterlineApi from '../source/CommuterlineApi'
import SchedulesParser from '../utils/ScheduleResponseParser'
import Station from '../model/stations.model'
import keyboard from '../utils/keyboardUtils'
import User from '../model/users.model'

const setupCallback = (bot: Telegraf) => {
  const api = CommuterlineApi.getInstance()

  bot.on(callbackQuery('data'), async (ctx) => {
    const { message, data } = ctx.callbackQuery

    // Parse Message
    if (!message || !('text' in message)) return

    const msgUtils = new MessageUtils(message.text)
    const timeRange: TimeRange = msgUtils.getTime() as TimeRange
    const stationCode: string = msgUtils.getStationCode() as string
    if (!timeRange || !stationCode) return

    // Get station
    let station: StationData = await Station.findOne({ stationCode }) as StationData
    if (!station) {
      const stations = await api.getStations() as Array<StationData>

      stations.forEach((st) => {
        st.stationName = st.stationName.replace(' ', '')
        if (st.stationCode === stationCode) { station = st }

        Station.findOneAndReplace(station)
      })
    }

    if (!station) return

    const param : string | null | undefined = data.match(/^TIME_/) && data.replace(/^TIME_/, '')
    if (param && param.match(/\d/)) {
      const startTime : moment.Moment = moment(timeRange.start, 'HH:mm')
      const endTime : moment.Moment = moment(timeRange.end, 'HH:mm')

      if (endTime.diff(startTime) >= 3 * 60 * 60 * 1000) { timeRange.start = moment(timeRange.start, 'HH:mm').add(param, 'hours').format('HH:mm') }

      timeRange.end = moment(timeRange.end, 'HH:mm').add(param, 'hours').format('HH:mm')

      const schedules = await api.getSchedules(stationCode, timeRange)

      const scheduleParser = new SchedulesParser(station, schedules, timeRange)

      await ctx.answerCbQuery()
      await ctx.editMessageText(scheduleParser.parse(), {
        parse_mode: 'Markdown',
        reply_markup: keyboard.pickTimeKeyboard().reply_markup
      })
    } else {
      const user = await User.findOneOrCreate(message.chat.id)
      user.setStation(station)

      await ctx.answerCbQuery()
      await ctx.reply('Kirim pesan dengan format HH:mm - HH:mm\ncontoh: 12:00 - 13:00')
    }
  })
}

export default setupCallback
