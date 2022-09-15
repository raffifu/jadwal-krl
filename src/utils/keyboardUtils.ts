import { Markup } from 'telegraf';
import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import Button from '../Button';
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

    inlineKeyboard.push([Button.BACK]);

    return Markup.keyboard(inlineKeyboard)
      .resize()
      .oneTime();
  },
  defaultKeyboard: () : Markup.Markup<ReplyKeyboardMarkup> => Markup.keyboard([
    [Button.STATION],
  ]).resize(),
  pickTimeKeyboard: (): Markup.Markup<InlineKeyboardMarkup> => Markup.inlineKeyboard([[
    Markup.button.callback('⏲️ +1 Jam', 'TIME_1'),
    Markup.button.callback('⏲️ +2 Jam', 'TIME_2'),
  ], [
    Markup.button.callback('Custom Time', 'TIME_CUSTOM'),
  ]]),
};

export default keyboard;
