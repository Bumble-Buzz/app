
const getDate = () => {
  return new Date();
};

const getTimestamp = () => {
  return new Date().getTime();
};


module.exports = {
  getDate,
  getTimestamp
}