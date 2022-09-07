import winston from 'winston';

const {
  combine, colorize, timestamp, align, printf,
} = winston.format;

const logger: winston.Logger = winston.createLogger({
  level: 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'DD-MM-YYYY hh:mm:ss A',
    }),
    align(),
    printf((log: winston.Logform.TransformableInfo) => `[${log.timestamp}] ${log.level} ${log.message}`),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
