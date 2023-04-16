import { Telegraf } from 'telegraf'
import logger from '../utils/logger'
import keyboard from '../utils/keyboardUtils'
import User from '../model/users.model'
import CommuterlineApi from '../source/CommuterlineApi'
import TrainScheduleParser from '../utils/TrainScheduleParser'

const api = CommuterlineApi.getInstance()

const setupCommand = (bot: Telegraf) => {
  bot.start(async (ctx) => {
    logger.info(`📥 RECEIVE_COMMAND StartHandler from ${ctx.message.chat.id}`)
    await User.findOneOrCreate(ctx.message.chat.id)

    await ctx.reply('Selamat Datang!', keyboard.defaultKeyboard())
  })

  bot.hears(/\/jadwal_/, async (ctx) => {
    const { text } = ctx.message

    const trainNum = (text.split('_').length === 2) && text.split('_')[1]
    if (!trainNum) return

    const schedule = await api.getTrainSchedule(trainNum)
    const trainScheduleParser = new TrainScheduleParser(schedule)

    await ctx.reply(
      trainScheduleParser.parse(),
      {
        parse_mode: 'Markdown',
        reply_to_message_id: ctx.message.message_id
      }
    )
  })
}

export default setupCommand
