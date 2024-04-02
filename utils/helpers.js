const get_today = () => {
  const now = new Date();
  const losAngelesDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  return format_date(losAngelesDate);
} 

const format_date = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const calculateDaysBetweenDates = (date1, date2) => {
  try {
    date1 = new Date(date1);
    date2 = new Date(date2);
  }
  catch {return null}
  const differenceInMilliseconds = Math.abs(date2 - date1);
  const days = differenceInMilliseconds / (24 * 60 * 60 * 1000);
  return days;
}

module.exports = { get_today, format_date, calculateDaysBetweenDates };