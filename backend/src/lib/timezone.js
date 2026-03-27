
const { formatInTimeZone } = require('https://esm.sh/date-fns-tz');

module.exports = {
  toClinicTime: (date, tz = 'America/Sao_Paulo') => {
    return formatInTimeZone(date, tz, 'yyyy-MM-dd HH:mm:ssXXX');
  },
  getCurrentClinicDate: (tz = 'America/Sao_Paulo') => {
    return formatInTimeZone(new Date(), tz, 'yyyy-MM-dd');
  }
};
