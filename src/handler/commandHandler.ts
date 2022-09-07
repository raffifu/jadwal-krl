import { Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import logger from '../utils/logger';
import keyboard from '../utils/keyboardUtils';

const commandHandler = {
  start: (
    ctx: Context<Update.MessageUpdate> &
    Omit<Context<Update>, keyof Context<Update>>,
  ) => {
    logger.info(`📥 RECEIVE_COMMAND StartHandler from ${ctx.message.chat.id}`);

    ctx.reply('Selamat Datang!', keyboard.defaultKeyboard());
  },
};

export default commandHandler;
