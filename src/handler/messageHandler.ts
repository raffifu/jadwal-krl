import { Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { StationData } from '../model/api';
import keyboard from '../utils/keyboardUtils';
import logger from '../utils/logger';
import CommuterlineApi from '../source/CommuterlineApi';
import DateUtils from '../utils/DateUtils';
import SchedulesParser from '../utils/ScheduleResponseParser';
import User from '../model/users.model';
import Station from '../model/stations.model';
import commandHandler from './commandHandler';

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
    logger.info(`📥 RECEIVE_MESSAGE station from ${ctx.message.chat.id}`);

    let stations: Array<StationData> = await Station.find() as Array<StationData>;
    if (stations.length === 0) {
      stations = await api.getStations() as Array<StationData>;
      stations.forEach((st) => {
        st.stationName = st.stationName.replace(' ', '');
        Station.findOneAndReplace(st);
      });
    }

    ctx.reply(
      'Silahkah Pilih Stasiun Keberangkatan',
      keyboard.stationKeyboard(stations),
    );
  },

  specificTimeMessage: async (ctx: Context<Update.MessageUpdate> &
    Omit<Context<Update>, keyof Context<Update>>) => {
    logger.info(`📥 RECEIVE_MESSAGE specificTimeMessage from ${ctx.message.chat.id}`);

    const { message } = ctx;
    if ('text' in message) {
      const msg: string = message.text;

      const timeRegex: RegExp = /([0-1]?[0-9]|2[0-3]):[0-5][0-9]/g;
      const times: RegExpMatchArray | null = msg.match(timeRegex);
      if (times && times.length === 2) {
        const user = await User.findOne({ chatId: message.chat.id });

        if (user === null || !user.station) {
          ctx.reply(
            'Anda Belum memilih stasiun keberangkatan',
            keyboard.defaultKeyboard(),
          );

          return;
        }

        const { station } = user;

        const timeRange = {
          start: times[0],
          end: times[1],
        };
        const schedules = await api.getSchedules(station.stationCode, timeRange);

        const scheduleParser = new SchedulesParser(station, schedules, timeRange);

        ctx.reply(
          scheduleParser.parse(),
          {
            parse_mode: 'Markdown',
            reply_to_message_id: ctx.message.message_id,
            reply_markup: keyboard.pickTimeKeyboard().reply_markup,
          },
        );
      }
    }
  },

  commonMessage: async (ctx: Context<Update.MessageUpdate> &
    Omit<Context<Update>, keyof Context<Update>>) => {
    const { message } = ctx;

    if ('text' in message) {
      logger.info(`📥 RECEIVE_MESSAGE commonMessage from ${ctx.message.chat.id} - ${message.text}`);

      const regex: RegExp = /\/\w+/g;
      const matches: RegExpMatchArray | null = message.text.match(regex);
      if (matches) {
        commandHandler.common(ctx);
        return;
      }

      const stationName: string = message.text.replace(' ', '').toUpperCase();
      let station: StationData = await Station.findOne({ stationName }) as StationData;
      if (!station) {
        const stations = await api.getStations() as Array<StationData>;

        stations.forEach((st) => {
          st.stationName = st.stationName.replace(' ', '');
          if (st.stationName === stationName) { station = st; }

          Station.findOneAndReplace(station);
        });
      }

      if (!station) return;

      const user = await User.findOneOrCreate(message.chat.id);

      user.setStation(station);

      const timeRange = new DateUtils().getTimeRange(1);
      const schedules = await api.getSchedules(station.stationCode, timeRange);

      const scheduleParser = new SchedulesParser(station, schedules, timeRange);

      ctx.reply(
        scheduleParser.parse(),
        {
          parse_mode: 'Markdown',
          reply_to_message_id: ctx.message.message_id,
          reply_markup: keyboard.pickTimeKeyboard().reply_markup,
        },
      );
    }
  },
};

export default messageHandler;
