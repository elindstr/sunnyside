const get_today = () => {
  date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`
}

const format_date = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`
};

const format_date_to_PST = (date) => {
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60000);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`
};

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

module.exports = { get_today, format_date, format_date_to_PST, calculateDaysBetweenDates };