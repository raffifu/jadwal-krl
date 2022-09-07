import { Telegraf } from 'telegraf';
import logger from './utils/logger';
import commandHandler from './handler/commandHandler';
import messageHandler from './handler/messageHandler';
import Button from './Button';

const token: string = process.env.BOT_TOKEN as string;

if (token === undefined) {
  throw new Error('BOT_TOKEN is not defined');
}

const bot: Telegraf = new Telegraf(token);

bot.start(commandHandler.start);
bot.hears(Button.CANCEL, messageHandler.cancel);
bot.hears(Button.STATION, messageHandler.station);
bot.on('message', messageHandler.commonMessage);

logger.info('🚀 START Application starting...');
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
