
const { format, parseISO } = require('https://esm.sh/date-fns');

module.exports = {
  formatToISO: (date) => format(date, "yyyy-MM-dd'T'HH:mm:ss"),
  parseFromISO: (dateStr) => parseISO(dateStr),
  isPast: (date) => new Date(date) < new Date()
};
