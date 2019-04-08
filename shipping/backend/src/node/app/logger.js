const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const level = process.env.LOG_LEVEL || 'debug';

const logger = createLogger({
  format: format.combine(
    format.splat(),
    format.simple()
    
  ),
  transports: [new transports.Console({
        level: level
          
  })]
});

module.exports = logger;


