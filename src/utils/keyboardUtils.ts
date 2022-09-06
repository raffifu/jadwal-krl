import { Markup } from 'telegraf';
import { ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { StationData } from '../model/api';

const keyboard = {
  stationKeyboard: (data: Array<StationData>) : Markup.Markup<ReplyKeyboardMarkup> => {
    const inlineKeyboard: Array<Array<string>> = data
      .reduce((prev: Array<Array<string>>, curr, idx) => {
        if (idx % 2) {
          prev[prev.length - 1].push(curr.stationName);
        } else {
          prev.push([curr.stationName]);
        }
        return prev;
      }, []);

    inlineKeyboard.push(['Batal']);

    return Markup.keyboard(inlineKeyboard)
      .resize()
      .oneTime();
  },
  defaultKeyboard: () : Markup.Markup<ReplyKeyboardMarkup> => Markup.keyboard([
    ['🚈 Jadwal KRL'],
  ]).resize(),
};

export default keyboard;
