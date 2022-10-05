import moment from 'moment-timezone';
import { TimeRange } from '../model/api';

export default class DateUtils {
  private moment: moment.Moment;

  constructor() {
    this.moment = moment().tz('Asia/Jakarta');
  }

  public getTimeRange(diff: number) : TimeRange {
    return {
      start: this.moment.format('HH:mm'),
      end: this.moment.add(diff, 'hours').format('HH:mm'),
    };
  }
}
