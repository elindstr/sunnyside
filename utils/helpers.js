module.exports = {
  format_time: (date) => {
    return date.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' });
  },
  format_date: (date) => {
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + (date.getFullYear());
  },
};
