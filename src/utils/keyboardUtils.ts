import { Markup } from 'telegraf';
import { ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
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

    inlineKeyboard.push([Button.CANCEL]);

    return Markup.keyboard(inlineKeyboard)
      .resize()
      .oneTime();
  },
  defaultKeyboard: () : Markup.Markup<ReplyKeyboardMarkup> => Markup.keyboard([
    [Button.STATION],
  ]).resize(),
};

export default keyboard;
