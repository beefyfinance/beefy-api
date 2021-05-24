const axios = require('axios');
const { compound } = require('../../../../utils/compound');
const {
  WEEKLY_HPY,
  FORTUBE_REQ_TOKENS,
  FORTUBE_REQ_MARKETS,
  FORTUBE_API_TOKEN,
} = require('../../../../constants');

const getFortubeApys = async () => {
  if (FORTUBE_API_TOKEN == undefined) {
    return console.warn('FORTUBE_API_TOKEN is undefined, skip loading Fortube APYs');
  }

  let fortubeApys = {};

  try {
    const resSimple = await axios.get(FORTUBE_REQ_TOKENS);
    const resExtended = await axios.get(FORTUBE_REQ_MARKETS, {
      headers: {
        authorization: FORTUBE_API_TOKEN,
      },
    });

    const dataSimple = resSimple.data;
    const dataExtended = resExtended.data.data;

    Object.values(dataSimple).map(item => {
      const symbol = item.symbol.toLowerCase();
      const apy = compound(parseFloat(item.estimated_ar), WEEKLY_HPY, 1, 0.95);
      fortubeApys[`fortube-${symbol}`] = apy;
    });

    dataExtended.map(item => {
      fortubeApys[`fortube-${item.token_symbol.toLowerCase()}`] += parseFloat(
        item.deposit_interest_rate
      );
    });
  } catch (err) {
    console.error('Fortube apy error:', err);
  }

  return fortubeApys;
};

module.exports = getFortubeApys;
