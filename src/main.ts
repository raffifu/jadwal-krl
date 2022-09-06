import { Telegraf } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { StationData } from './model/api';
import CommuterlineApi from './source/CommuterlineApi';
import DateUtils from './utils/DateUtils';
import keyboard from './utils/keyboardUtils';
import ScheduleResponseParser from './utils/ScheduleResponseParser';

const token: string = process.env.BOT_TOKEN as string;
const apiUrl: string = process.env.API_URL as string;

if (token === undefined) {
  throw new Error('BOT_TOKEN is not defined');
}

if (apiUrl === undefined) {
  throw new Error('API_URL is not defined');
}

const bot: Telegraf = new Telegraf(token);
const api = new CommuterlineApi(apiUrl);

bot.start((ctx) => {
  ctx.reply(
    'Selamat Datang!',
    keyboard.defaultKeyboard(),
  );
});

bot.hears('Batal', (ctx) => {
  ctx.reply(
    'Kembali ke Menu Awal',
    keyboard.defaultKeyboard(),
  );
});

bot.hears('🚈 Jadwal KRL', async (ctx) => {
  const stations: Array<StationData> = await api.getStations();

  ctx.reply(
    'Silahkah Pilih Stasiun Keberangkatan',
    keyboard.stationKeyboard(stations),
  );
});

bot.on('message', async (ctx) => {
  const { message } = ctx;

  if ('text' in message) {
    const stations: Array<StationData> = await api.getStations();
    const station: StationData = stations.find((st) => st.stationName === message.text)!;

    if (station) {
      const dateUtils = new DateUtils();
      const schedules = await api.getSchedules(station.stationCode, dateUtils.getTimeRange(3));

      const scheduleParser = new ScheduleResponseParser(station, schedules);
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
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
