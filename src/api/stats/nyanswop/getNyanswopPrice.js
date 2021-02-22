const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');
const axios = require('axios');

const ERC20 = require('../../../abis/ERC20.json');
const pools = require('../../../data/nyanswopLpPools.json');

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const USDT = '0x55d398326f99059fF775485246999027B3197955';
const CoingeckoApi = 'https://api.coingecko.com/api/v3/simple/price';

const nyanswopPriceCache = {};

const getNyanswopTokenPrices = async () => {
  if (Object.keys(nyanswopPriceCache).length !== 0) {
    return nyanswopPriceCache;
  }

  const bnbPrice = await fetchCoingecko('binancecoin');
  const udstPrice = 1;
  const defaultPrice = 0; // for error catchng

  let promises = [];
  let ids = [];
  pools.forEach(pool => {
    const lpToken = pool.address;
    const unknownPriceToken = pool.lp0; // assumed not wbnb or usdt (check pool json)
    const knownPriceToken = pool.lp1; // assume to be wbnb or usdt
    let unknownTokenPriceInUsd;
    if (knownPriceToken.address === WBNB) {
      unknownTokenPriceInUsd = getTokenPriceInUsd(
        lpToken,
        unknownPriceToken,
        knownPriceToken,
        bnbPrice
      );
    } else if (knownPriceToken.address === USDT) {
      unknownTokenPriceInUsd = getTokenPriceInUsd(
        lpToken,
        unknownPriceToken,
        knownPriceToken,
        udstPrice
      );
    } else {
      unknownTokenPriceInUsd = getTokenPriceInUsd(
        lpToken,
        unknownPriceToken,
        knownPriceToken,
        defaultPrice
      );
    }
    promises.push(unknownTokenPriceInUsd);
    ids.push(unknownPriceToken.oracleId);
  });

  const values = await Promise.all(promises);
  values.forEach((value, index) => {
    nyanswopPriceCache[ids[index]] = Number(value.toString());
  });

  return nyanswopPriceCache;
};

const getNyanswopTokenPrice = async id => {
  if (Object.keys(nyanswopPriceCache).length === 0) {
    await getNyanswopTokenPrices();
  }
  return Number(nyanswopPriceCache[id].toString());
};

const getTokenPriceInUsd = async (
  lpContract,
  unknownPriceToken,
  knownPriceToken,
  knownPriceTokenPriceUnit,
  decimals = '1e18'
) => {
  const knownPriceTokenContract = new web3.eth.Contract(ERC20, knownPriceToken.address);
  const knownPriceTokenTotalStaked = new BigNumber(
    await knownPriceTokenContract.methods.balanceOf(lpContract).call()
  );
  const knownPriceTokenTotalStakedUsdt = knownPriceTokenTotalStaked.times(knownPriceTokenPriceUnit); // half value of entire LP

  const unknownPriceTokenContract = new web3.eth.Contract(ERC20, unknownPriceToken.address);
  const unknownPriceTokenTotalStaked = new BigNumber(
    await unknownPriceTokenContract.methods.balanceOf(lpContract).call()
  );
  const unknownPriceTokenPriceUnit = knownPriceTokenTotalStakedUsdt.dividedBy(
    unknownPriceTokenTotalStaked
  );

  return unknownPriceTokenPriceUnit;
};

const fetchCoingecko = async id => {
  try {
    const response = await axios.get(CoingeckoApi, {
      params: { ids: id, vs_currencies: 'usd' },
    });
    return response.data[id].usd;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

module.exports = { getNyanswopTokenPrices, getNyanswopTokenPrice };
