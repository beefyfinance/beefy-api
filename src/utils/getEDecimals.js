const getEDecimals = decimals => {
  return '1e' + decimals.toString();
};

module.exports = {
  getEDecimals,
};
