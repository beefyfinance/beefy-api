const BigNumber = require('bignumber.js');
const { ethers } = require('ethersv5');
const { MULTICHAIN_RPC } = require('../constants');

const MULTICALLS = {
  56: '0xbcf79F67c2d93AD5fd1b919ac4F5613c493ca34F',
  128: '0x6066F766f47aC8dbf6F21aDF2493316A8ACB7e34',
  137: '0x2D955C68f8c687242d7475cD0Cc86E6a4A6D968e',
  250: '0x1E715c49A810ff428a128b1bBdee221eF9548F67',
  43114: '0x294d57F60f71036d9C96b008E32744D0909FABbA',
  1666600000: '0xa9E6E271b27b20F65394914f8784B3B860dBd259',
  42161: '0x405EE7F4f067604b787346bC22ACb66b06b15A4B',
  42220: '0xE99c8A590c98c7Ae9FB3B7ecbC115D2eBD533B50',
  1285: '0x8a198BCbF313A5565c64A7Ed61FaA413eB4E0931',
  25: '0x405EE7F4f067604b787346bC22ACb66b06b15A4B',
  1313161554: '0xFE40f6eAD11099D91D51a945c145CFaD1DD15Bb8',
  122: '0xE99c8A590c98c7Ae9FB3B7ecbC115D2eBD533B50',
  1088: '0xfcDD5a02C611ba6Fe2802f885281500EC95805d7',
  1284: '0xd9F2Da642FAA1307e4F70a5E3aC31b9bfe920eAF',
  57: '0x820ae7BF39792D7ce7befC70B0172F4D267F1938',
  42262: '0xE99c8A590c98c7Ae9FB3B7ecbC115D2eBD533B50',
};

const MulticallAbi = require('../abis/BeefyPriceMulticall.json');
const ERC20 = require('../abis/common/ERC20/ERC20.json');
const BATCH_SIZE = 128;

const sortByKeys = o => {
  return Object.keys(o)
    .sort()
    .reduce((r, k) => ((r[k] = o[k]), r), {});
};

const calcTokenPrice = (knownPrice, knownToken, unknownToken) => {
  const valuation = knownToken.balance.dividedBy(knownToken.decimals).multipliedBy(knownPrice);
  const price = valuation.multipliedBy(unknownToken.decimals).dividedBy(unknownToken.balance);
  const weight = knownToken.balance.plus(unknownToken.balance).toNumber();

  return {
    price: price.toNumber(),
    weight: unknownToken.balance.dividedBy(unknownToken.decimals).toNumber(),
  };
};

const calcLpPrice = (pool, tokenPrices) => {
  const lp0 = pool.lp0.balance
    .multipliedBy(tokenPrices[pool.lp0.oracleId])
    .dividedBy(pool.lp0.decimals);
  const lp1 = pool.lp1.balance
    .multipliedBy(tokenPrices[pool.lp1.oracleId])
    .dividedBy(pool.lp1.decimals);
  return lp0.plus(lp1).multipliedBy(pool.decimals).dividedBy(pool.totalSupply).toNumber();
};

const fetchAmmPrices = async (pools, knownPrices) => {
  let prices = { ...knownPrices };
  let lps = {};
  let weights = {};
  Object.keys(knownPrices).forEach(known => {
    weights[known] = Number.MAX_SAFE_INTEGER;
  });

  for (let chain in MULTICALLS) {
    let filtered = pools.filter(p => p.chainId == chain);

    // Old BSC pools don't have the chainId attr
    if (chain == '56') {
      filtered = pools.filter(p => p.chainId === undefined).concat(filtered);
    }

    // Setup multichain
    const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chain]);
    const multicall = new ethers.Contract(MULTICALLS[chain], MulticallAbi, provider);

    // Split query in batches
    const query = filtered.map(p => [p.address, p.lp0.address, p.lp1.address]);
    for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
      const batch = query.slice(i, i + BATCH_SIZE);
      let buf = [];
      try {
        buf = await multicall.getLpInfo(batch);
      } catch (e) {
        console.error('fetchAmmPrices', e);
      }

      // Merge fetched data
      for (let j = 0; j < batch.length; j++) {
        filtered[j + i].totalSupply = new BigNumber(buf[j * 3 + 0]?.toString());
        filtered[j + i].lp0.balance = new BigNumber(buf[j * 3 + 1]?.toString());
        filtered[j + i].lp1.balance = new BigNumber(buf[j * 3 + 2]?.toString());
      }
    }

    const unsolved = filtered.slice();
    let solving = true;
    while (solving) {
      solving = false;

      for (let i = unsolved.length - 1; i >= 0; i--) {
        const pool = unsolved[i];

        let knownToken, unknownToken;
        if (pool.lp0.oracleId in prices) {
          knownToken = pool.lp0;
          unknownToken = pool.lp1;
        } else if (pool.lp1.oracleId in prices) {
          knownToken = pool.lp1;
          unknownToken = pool.lp0;
        } else {
          console.log('unsolved: ', pool.lp0.oracleId, pool.lp1.oracleId, pool.name);
          continue;
        }

        const { price, weight } = calcTokenPrice(
          prices[knownToken.oracleId],
          knownToken,
          unknownToken
        );
        if (weight > (weights[unknownToken.oracleId] || 0)) {
          prices[unknownToken.oracleId] = price;
          weights[unknownToken.oracleId] = weight;
        }
        lps[pool.name] = calcLpPrice(pool, prices);

        unsolved.splice(i, 1);
        solving = true;
      }
    }
  }

  return {
    poolPrices: sortByKeys(lps),
    tokenPrices: sortByKeys(prices),
  };
};

module.exports = { fetchAmmPrices };
