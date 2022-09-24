import { Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import moment from 'moment';
import { StationData, TimeRange } from '../model/api';
import MessageUtils from '../utils/MessageUtils';
import CommuterlineApi from '../source/CommuterlineApi';
import ScheduleResponseParser from '../utils/ScheduleResponseParser';
import Station from '../model/stations.model';
import keyboard from '../utils/keyboardUtils';
import DateUtils from '../utils/DateUtils';

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

  const param : string | null | undefined = callbackData?.match(/^TIME_/) && callbackData.replace(/^TIME_/, '');

  if (!message || !('text' in message)) return;
  if (param && !param.match(/\d/)) return;

  const msgUtils = new MessageUtils(message.text);
  const timeRange: TimeRange = msgUtils.getTime() as TimeRange;
  const stationCode: string = msgUtils.getStationCode() as string;

  if (!timeRange || !stationCode) return;

  timeRange.start = moment(timeRange.start, 'HH:mm').add(param, 'hours').format('HH:mm');
  timeRange.end = moment(timeRange.end, 'HH:mm').add(param, 'hours').format('HH:mm');

  const schedules = await api.getSchedules(stationCode, timeRange);

  let station: StationData = await Station.findOne({ stationCode }) as StationData;
  if (!station) {
    const stations = await api.getStations() as Array<StationData>;
    await Station.insertMany(stations, { ordered: false });
    station = stations.find((st) => st.stationCode === stationCode)!;
  }

  if (!station) return;

  const scheduleParser = new ScheduleResponseParser(station, schedules, timeRange);

  await ctx.answerCbQuery();
  await ctx.editMessageText(scheduleParser.parse(), {
    parse_mode: 'Markdown',
    reply_markup: keyboard.pickTimeKeyboard().reply_markup,
  });
};

export default callbackHandler;
