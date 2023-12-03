const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const { combine, timestamp, json } = winston.format;

const fileRotateTransport = new DailyRotateFile({
    filename: 'logs/app-log-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '1d',

});

const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS A', // 2022-01-25 03:23:10.350 PM
    }), json()),
    transports: [fileRotateTransport]
});

module.exports = logger;