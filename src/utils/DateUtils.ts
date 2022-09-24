import moment from 'moment';
import { TimeRange } from '../model/api';

export default class DateUtils {
  private moment: moment.Moment;

  constructor() {
    this.moment = moment();
  }

  public getTimeRange(diff: number) : TimeRange {
    return {
      start: this.moment.format('HH:mm'),
      end: this.moment.add(diff, 'hours').format('HH:mm'),
    };
  }
}
