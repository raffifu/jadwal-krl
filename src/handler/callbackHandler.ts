import { Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import moment from 'moment-timezone';
import { StationData, TimeRange } from '../model/api';
import MessageUtils from '../utils/MessageUtils';
import CommuterlineApi from '../source/CommuterlineApi';
import ScheduleResponseParser from '../utils/ScheduleResponseParser';
import Station from '../model/stations.model';
import keyboard from '../utils/keyboardUtils';
import User from '../model/users.model';

const apiUrl: string = process.env.API_URL as string;

if (apiUrl === undefined) {
  throw new Error('API_URL is not defined');
}

const api: CommuterlineApi = new CommuterlineApi(apiUrl);

const callbackHandler = async (ctx: Context<Update.CallbackQueryUpdate> &
  Omit<Context<Update>, keyof Context<Update>>) => {
  const { callback_query } = ctx.update;
  const callbackData = callback_query?.data;
  const { message } = callback_query;

  // Parse Message
  if (!message || !('text' in message)) return;

  const msgUtils = new MessageUtils(message.text);
  const timeRange: TimeRange = msgUtils.getTime() as TimeRange;
  const stationCode: string = msgUtils.getStationCode() as string;
  if (!timeRange || !stationCode) return;

  // Get station
  let station: StationData = await Station.findOne({ stationCode }) as StationData;
  if (!station) {
    const stations = await api.getStations() as Array<StationData>;

    stations.forEach((st) => {
      if (st.stationCode === stationCode) { station = st; }

      Station.findOneAndReplace(station);
    });
  }

  if (!station) return;

  const param : string | null | undefined = callbackData?.match(/^TIME_/) && callbackData.replace(/^TIME_/, '');
  if (param && param.match(/\d/)) {
    const startTime : moment.Moment = moment(timeRange.start, 'HH:mm');
    const endTime : moment.Moment = moment(timeRange.end, 'HH:mm');

    if (endTime.diff(startTime) >= 3 * 60 * 60 * 1000) { timeRange.start = moment(timeRange.start, 'HH:mm').add(param, 'hours').format('HH:mm'); }

    timeRange.end = moment(timeRange.end, 'HH:mm').add(param, 'hours').format('HH:mm');

    const schedules = await api.getSchedules(stationCode, timeRange);

    const scheduleParser = new ScheduleResponseParser(station, schedules, timeRange);

    await ctx.answerCbQuery();
    await ctx.editMessageText(scheduleParser.parse(), {
      parse_mode: 'Markdown',
      reply_markup: keyboard.pickTimeKeyboard().reply_markup,
    });
  } else {
    const user = await User.findOneOrCreate(message.chat.id);
    user.setStation(station);

    await ctx.answerCbQuery();
    await ctx.reply('Kirim pesan dengan format HH:mm - HH:mm\ncontoh: 12:00 - 13:00');
  }
};

export default callbackHandler;
