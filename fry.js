const axios = require('axios');
const web3 = require('web3');

const { compound } = require('./src/utils/compound');

const getPrice = async id => {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
    params: {
      ids: id,
      vs_currencies: 'usd',
    },
  });

  return response.data.fryworld.usd;
};
