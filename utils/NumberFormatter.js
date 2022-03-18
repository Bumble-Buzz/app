module.exports = (value, format) => {
  const formatter = Intl.NumberFormat('en', {
    style: format,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  });
  return formatter.format(value);
};
