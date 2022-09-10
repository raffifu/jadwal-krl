import { Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { StationData } from '../model/api';
import keyboard from '../utils/keyboardUtils';
import logger from '../utils/logger';
import CommuterlineApi from '../source/CommuterlineApi';
import DateUtils from '../utils/DateUtils';
import ScheduleResponseParser from '../utils/ScheduleResponseParser';

const apiUrl: string = process.env.API_URL as string;

if (apiUrl === undefined) {
  throw new Error('API_URL is not defined');
}

const api: CommuterlineApi = new CommuterlineApi(apiUrl);

const messageHandler = {
  cancel: (ctx: Context<Update.MessageUpdate> &
    Omit<Context<Update>, keyof Context<Update>>) => {
    logger.info(`📥 RECEIVE_MESSAGE CancelHandler from ${ctx.message.chat.id}`);

    ctx.reply(
      'Kembali ke Menu Awal',
      keyboard.defaultKeyboard(),
    );
  },

  station: async (ctx: Context<Update.MessageUpdate> &
    Omit<Context<Update>, keyof Context<Update>>) => {
    logger.info(`📥 RECEIVE_MESSAGE ScheduleHandler from ${ctx.message.chat.id}`);

    const stations: Array<StationData> = await api.getStations() as Array<StationData>;

    ctx.reply(
      'Silahkah Pilih Stasiun Keberangkatan',
      keyboard.stationKeyboard(stations),
    );
  },

  specificTimeMessage: async (ctx: Context<Update.MessageUpdate> &
    Omit<Context<Update>, keyof Context<Update>>) => {
    const { message } = ctx;
    if ('text' in message) {
      const msg: string = message.text;

      const timeRegex: RegExp = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const times: Array<string> = msg.split('-').map((str) => str.trim());
      if (times.length === 2 && times.every((time) => time.match(timeRegex))) {
        // TODO: Get station from database
        // If not exist, send error response to user
        const stations: Array<StationData> = await api.getStations() as Array<StationData>;
        const station: StationData = stations.find((st) => st.stationName === 'LEMPUYANGAN')!;

        const timeRange = {
          start: times[0],
          end: times[1],
        };
        const schedules = await api.getSchedules(station.stationCode, timeRange);

        const scheduleParser = new ScheduleResponseParser(station, schedules, timeRange);

        ctx.reply(
          scheduleParser.parse(),
          {
            parse_mode: 'Markdown',
            reply_to_message_id: ctx.message.message_id,
            reply_markup: keyboard.defaultKeyboard().reply_markup,
          },
        );
      }
    }
  },

  commonMessage: async (ctx: Context<Update.MessageUpdate> &
    Omit<Context<Update>, keyof Context<Update>>) => {
    const { message } = ctx;

    if ('text' in message) {
      logger.info(`📥 RECEIVE_MESSAGE StationHandler from ${ctx.message.chat.id} - ${message.text}`);

      // TODO: Get station from database
      // If not exist, get stations from API
      const stations: Array<StationData> = await api.getStations() as Array<StationData>;
      const station: StationData = stations.find((st) => st.stationName === message.text)!;

      if (station) {
        const timeRange = new DateUtils().getTimeRange(3);
        const schedules = await api.getSchedules(station.stationCode, timeRange);

        const scheduleParser = new ScheduleResponseParser(station, schedules, timeRange);

        ctx.reply(
          scheduleParser.parse(),
          {
            parse_mode: 'Markdown',
            reply_to_message_id: ctx.message.message_id,
            reply_markup: keyboard.defaultKeyboard().reply_markup,
          },
        );
      }
    }
  },
};

export default messageHandler;
