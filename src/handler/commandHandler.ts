import { Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import logger from '../utils/logger';
import keyboard from '../utils/keyboardUtils';
import User from '../model/users.model';
import CommuterlineApi from '../source/CommuterlineApi';
import TrainScheduleParser from '../utils/TrainScheduleParser';

const apiUrl: string = process.env.API_URL as string;

if (apiUrl === undefined) {
  throw new Error('API_URL is not defined');
}

const api: CommuterlineApi = new CommuterlineApi(apiUrl);

const commandHandler = {
  start: async (
    ctx: Context<Update.MessageUpdate> &
    Omit<Context<Update>, keyof Context<Update>>,
  ) => {
    logger.info(`📥 RECEIVE_COMMAND StartHandler from ${ctx.message.chat.id}`);
    await User.findOneOrCreate(ctx.message.chat.id);

    ctx.reply('Selamat Datang!', keyboard.defaultKeyboard());
  },
  common: async (
    ctx: Context<Update.MessageUpdate> &
    Omit<Context<Update>, keyof Context<Update>>,
  ) => {
    logger.info(`📥 RECEIVE_COMMAND CommandCommonHandler from ${ctx.message.chat.id}`);

    if ('text' in ctx.message) {
      const { text } = ctx.message;
      const regex: RegExp = /\/jadwal_\w+/g;
      const matches: RegExpMatchArray | null = text.match(regex);

      if (matches && text.split('_').length === 2) {
        const trainNum: string = text.split('_')[1];
        const schedule = await api.getTrainSchedule(trainNum);

        const trainScheduleParser = new TrainScheduleParser(schedule);

        ctx.reply(
          trainScheduleParser.parse(),
          {
            parse_mode: 'Markdown',
            reply_to_message_id: ctx.message.message_id,
          },
        );
      }
    }
  },
};

export default commandHandler;
