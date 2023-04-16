import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { StationData } from '../model/api'
import keyboard from '../utils/keyboardUtils'
import logger from '../utils/logger'
import CommuterlineApi from '../source/CommuterlineApi'
import DateUtils from '../utils/DateUtils'
import SchedulesParser from '../utils/ScheduleResponseParser'
import User from '../model/users.model'
import Station from '../model/stations.model'
import Button from '../Button'

const api = CommuterlineApi.getInstance()

const setupMessage = (bot: Telegraf) => {
  bot.hears(Button.BACK, async (ctx) => {
    logger.info(`📥 RECEIVE_MESSAGE CancelHandler from ${ctx.message.chat.id}`)

    await ctx.reply(
      'Kembali ke Menu Awal',
      keyboard.defaultKeyboard()
    )
  })

  bot.hears(Button.STATION, async (ctx) => {
    logger.info(`📥 RECEIVE_MESSAGE station from ${ctx.message.chat.id}`)

    let stations: Array<StationData> = await Station.find() as Array<StationData>
    if (stations.length === 0) {
      stations = await api.getStations() as Array<StationData>
      stations.forEach((st) => {
        st.stationName = st.stationName.replace(' ', '')
        Station.findOneAndReplace(st)
      })
    }

    await ctx.reply(
      'Silahkah Pilih Stasiun Keberangkatan',
      keyboard.stationKeyboard(stations)
    )
  })

  bot.hears(/-/, async (ctx) => {
    logger.info(`📥 RECEIVE_MESSAGE specificTimeMessage from ${ctx.message.chat.id}`)

    const { message } = ctx

    const user = await User.findOne({ chatId: message.chat.id })

    if (user === null || !user.station) {
      await ctx.reply(
        'Anda Belum memilih stasiun keberangkatan',
        keyboard.defaultKeyboard()
      )

      return
    }

    const timeRegex: RegExp = /([0-1]?[0-9]|2[0-3]):[0-5][0-9]/g
    const times: RegExpMatchArray | null = message.text.match(timeRegex)

    if (!times || times.length !== 2) {
      await ctx.reply(
        'Format salah',
        keyboard.defaultKeyboard()
      )

      return
    }

    const timeRange = {
      start: times[0],
      end: times[1]
    }

    const schedules = await api.getSchedules(user.station.stationCode, timeRange)
    const scheduleParser = new SchedulesParser(user.station, schedules, timeRange)

    await ctx.reply(
      scheduleParser.parse(),
      {
        parse_mode: 'Markdown',
        reply_to_message_id: ctx.message.message_id,
        reply_markup: keyboard.pickTimeKeyboard().reply_markup
      }
    )
  })

  bot.on(message('text'), async (ctx) => {
    const { message } = ctx

    logger.info(`📥 RECEIVE_MESSAGE commonMessage from ${ctx.message.chat.id} - ${message.text}`)

    const stationName: string = message.text.replace(' ', '').toUpperCase()
    let station: StationData = await Station.findOne({ stationName }) as StationData
    if (!station) {
      const stations = await api.getStations() as Array<StationData>

      stations.forEach((st) => {
        st.stationName = st.stationName.replace(' ', '')
        if (st.stationName === stationName) { station = st }

        Station.findOneAndReplace(station)
      })
    }

    if (!station) return

    const user = await User.findOneOrCreate(message.chat.id)

    user.setStation(station)

    const timeRange = new DateUtils().getTimeRange(1)
    const schedules = await api.getSchedules(station.stationCode, timeRange)

    const scheduleParser = new SchedulesParser(station, schedules, timeRange)

    await ctx.reply(
      scheduleParser.parse(),
      {
        parse_mode: 'Markdown',
        reply_to_message_id: ctx.message.message_id,
        reply_markup: keyboard.pickTimeKeyboard().reply_markup
      }
    )
  })
}

export default setupMessage
