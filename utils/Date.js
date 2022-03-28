
const _padTo2Digits = (num) => {
  return num.toString().padStart(2, '0');
};

const getDate = () => {
  return new Date();
};

const getTimestamp = () => {
  return new Date().getTime();
};

const getDateFromTimestamp = (_timestamp) => {
  return new Date(Number(_timestamp));
};

const getDateFromIsoTimestamp = (_isoTimestamp) => {
  return new Date(_isoTimestamp);
};

const getIsoDate = (_input) => {
  const date = (_input instanceof Date) ? _input : getDateFromTimestamp(_input);
  return [
    date.getFullYear(),
    _padTo2Digits(date.getMonth() + 1),
    _padTo2Digits(date.getDate())
  ].join('-');
};

const getShortDate = (_input) => {
  const date = (_input instanceof Date) ? _input : getDateFromTimestamp(_input);
  return [
    _padTo2Digits(date.getMonth() + 1),
    _padTo2Digits(date.getDate()),
    date.getFullYear().toString().slice(-2)
  ].join('/');
};

const getLongDate = (_input) => {
  const date = (_input instanceof Date) ? _input : getDateFromTimestamp(_input);
  const dateArray = date.toDateString().split(' ');
  dateArray.shift();
  return dateArray.join(' ');
};

const getIsoTimezone = (_input) => {
  const date = (_input instanceof Date) ? _input : getDateFromTimestamp(_input);
  var timezoneOffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
  var localISOTime = (new Date(Date.now() - timezoneOffset)).toISOString().slice(0, -1);
  return localISOTime;
};


module.exports = {
  getDate,
  getTimestamp,
  getDateFromTimestamp,
  getDateFromIsoTimestamp,
  getIsoDate,
  getShortDate,
  getLongDate,
  getIsoTimezone
}