import { Telegraf } from 'telegraf';
import logger from './utils/logger';
import MongoDbConnection from './source/db';
import commandHandler from './handler/commandHandler';
import messageHandler from './handler/messageHandler';
import Button from './Button';
import callbackHandler from './handler/callbackHandler';

const token: string = process.env.BOT_TOKEN as string;

if (token === undefined) {
  throw new Error('BOT_TOKEN is not defined');
}

const mongoConn = MongoDbConnection.getInstance();

const bot: Telegraf = new Telegraf(token);

bot.start(commandHandler.start);
bot.hears(Button.BACK, messageHandler.cancel);
bot.hears(Button.STATION, messageHandler.station);
bot.hears(/-/, messageHandler.specificTimeMessage);
bot.on('callback_query', callbackHandler);
bot.on('message', messageHandler.commonMessage);

bot.catch((err) => {
  logger.error(err);
});

logger.info('🚀 START Application starting...');
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  mongoConn.disconnect();
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  mongoConn.disconnect();
});
