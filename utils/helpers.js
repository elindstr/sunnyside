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
  // console.log('15:', date)
  let offset = 7 * 60000;
  date = new Date(date.getTime() + offset);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`
};

const format_date_output = (date) => {
  if (typeof date !== 'string') date = date.toISOString()
  return date.replace('T', ' ').substring(0, 10);
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

module.exports = { get_today, format_date, format_date_to_PST, format_date_output, calculateDaysBetweenDates };