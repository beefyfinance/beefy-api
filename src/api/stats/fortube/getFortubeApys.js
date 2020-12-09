const axios = require('axios');
const { compound } = require('../../../utils/compound');

const getFortubeApys = async () => {
  let fortubeApys = {};

  const resSimple = await axios.get(process.env.FORTUBE_REQ_TOKENS);
  const resExtended = await axios.get(process.env.FORTUBE_REQ_MARKETS, {
    headers: {
      authorization: process.env.FORTUBE_API_TOKEN,
    },
  });

  const dataSimple = resSimple.data;
  const dataExtended = resExtended.data.data;

  Object.values(dataSimple).map(item => {
    const symbol = item.symbol.toLowerCase();
    const apy = compound(parseFloat(item.estimated_ar), process.env.WEEKLY_HPY, 1, 0.95);
    fortubeApys[`fortube-${symbol}`] = apy;
  });

  dataExtended.map(item => {
    fortubeApys[`fortube-${item.token_symbol.toLowerCase()}`] += parseFloat(
      item.deposit_interest_rate
    );
  });

  return fortubeApys;
};

module.exports = getFortubeApys;
