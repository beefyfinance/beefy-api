const getScientificNotationFromTokenDecimals = decimals => {
  return '1e' + decimals.toString();
};

module.exports = {
  getScientificNotationFromTokenDecimals,
};
