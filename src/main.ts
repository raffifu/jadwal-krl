import { Telegraf } from 'telegraf'
import logger from './utils/logger'
import MongoDbConnection from './source/db'
import setupCommand from './handler/commandHandler'
import setupCallback from './handler/callbackHandler'
import setupMessage from './handler/messageHandler'

const token: string = process.env.BOT_TOKEN as string

if (token === undefined) {
  throw new Error('BOT_TOKEN is not defined')
}

const mongoCon = MongoDbConnection.getInstance()

const bot: Telegraf = new Telegraf(token)

setupCommand(bot)
setupCallback(bot)
setupMessage(bot)

bot.catch(async (err, ctx) => {
  logger.error(err)

  await ctx.reply('Application Error: Try again')
})

logger.info('🚀 START Application starting...')
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT')
  mongoCon.disconnect()
})

process.once('SIGTERM', () => {
  bot.stop('SIGTERM')
  mongoCon.disconnect()
})
