import { TimeRange } from '../model/api';

export default class DateUtils {
  private dateNow: Date;

  private endDate: Date;

  private options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  };

  constructor() {
    const unixTime = Date.now();
    this.dateNow = new Date(unixTime);
    this.endDate = new Date(unixTime);
  }

  public getTimeRange(diff: number) : TimeRange {
    this.addHours(diff);

    return {
      start: this.dateNow.toLocaleString('en-US', this.options),
      end: this.endDate.toLocaleString('en-US', this.options),
    };
  }

  private addHours(diff: number) {
    this.endDate.setHours(this.endDate.getHours() + diff);
  }
}
