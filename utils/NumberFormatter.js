module.exports = (value, format, options = {}) => {
  const formatter = Intl.NumberFormat('en', {
    style: format,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: options.maximumFractionDigits || 4
  });
  return formatter.format(value);
};
