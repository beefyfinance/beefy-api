const BigNumber = require('bignumber.js');
const { fetchContract } = require('../api/rpc/client');
const { chunk } = require('lodash');
const { default: BeefyPriceMulticall } = require('../abis/BeefyPriceMulticall');
const { retryPromiseWithBackOff } = require('./promise');

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
  1284: '0xd1d13EaAb9A92c47E8D11628AE6cb6C824E85E4B',
  42262: '0xE99c8A590c98c7Ae9FB3B7ecbC115D2eBD533B50',
  10: '0x13C6bCC2411861A31dcDC2f990ddbe2325482222',
  2222: '0xA338D34c5de06B88197609956a2dEAAfF7Af46c8',
  1: '0x9D55cAEE108aBdd4C47E42088C97ecA43510E969',
  7700: '0xe6CcE165Aa3e52B2cC55F17b1dBC6A8fe5D66610',
  324: '0x8BBbA444553e149968A52f46d1294C280C1458B6',
  1101: '0x448a3539a591dE3Fb9D5AAE407471D21d40cD315',
  8453: '0x3AA76f4aD5cc43E530a6C51c8eb13c40a3753aae',
  100: '0x07f1ad98b725Af45485646aC431b7757f50C598A',
  59144: '0xe103ab2f922aa1a56EC058AbfDA2CeEa1e95bCd7',
  5000: '0xee59DE6E749cc6cF6ebD30878D8B4222C4aea37C',
};

const BATCH_SIZE = 128;
const DEBUG_ORACLES = [];

const sortByKeys = o => {
  return Object.keys(o)
    .sort()
    .reduce((r, k) => ((r[k] = o[k]), r), {});
};

const calcTokenPrice = (knownPrice, knownToken, unknownToken) => {
  const valuation = knownToken.balance.dividedBy(knownToken.decimals).multipliedBy(knownPrice);
  const price = valuation.multipliedBy(unknownToken.decimals).dividedBy(unknownToken.balance);

  //  console.log(knownToken)
  //  console.log(knownPrice)
  //  console.log(unknownToken)
  //  console.log(price.toNumber())

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
  const price = lp0.plus(lp1).multipliedBy(pool.decimals).dividedBy(pool.totalSupply).toNumber();

  return {
    price,
    tokens: [pool.lp0.address, pool.lp1.address],
    balances: [
      pool.lp0.balance.dividedBy(pool.lp0.decimals).toString(10),
      pool.lp1.balance.dividedBy(pool.lp1.decimals).toString(10),
    ],
    totalSupply: pool.totalSupply.dividedBy(pool.decimals).toString(10),
  };
};

const fetchAmmPrices = async (pools, knownPrices) => {
  let prices = { ...knownPrices };
  let lps = {};
  let breakdown = {};
  let weights = {};

  Object.keys(knownPrices).forEach(known => {
    weights[known] = Number.MAX_SAFE_INTEGER;
  });
  const promises = Object.keys(MULTICALLS).map(async chain => {
    let chainPools = pools.filter(p => p.chainId == chain);
    // Old BSC pools don't have the chainId attr
    if (chain == '56') {
      chainPools = pools.filter(p => p.chainId === undefined).concat(chainPools);
    }
    await fetchChainPools(chain, chainPools);
    return chainPools;
  });

  const allPools = await Promise.all(promises);
  for (let filtered of allPools) {
    const unsolved = filtered.slice();
    let solving = true;
    while (solving) {
      solving = false;

      for (let i = unsolved.length - 1; i >= 0; i--) {
        const pool = unsolved[i];
        const trySolve = [];

        if (pool.lp0.oracleId in weights && pool.lp1.oracleId in weights) {
          trySolve.push({ knownToken: pool.lp0, unknownToken: pool.lp1 });
          trySolve.push({ knownToken: pool.lp1, unknownToken: pool.lp0 });
        } else if (pool.lp0.oracleId in prices) {
          trySolve.push({ knownToken: pool.lp0, unknownToken: pool.lp1 });
        } else if (pool.lp1.oracleId in prices) {
          trySolve.push({ knownToken: pool.lp1, unknownToken: pool.lp0 });
        } else {
          // both unknown: not solved yet but could be solved later
          continue;
        }

        for (const { knownToken, unknownToken } of trySolve) {
          const { price, weight } = calcTokenPrice(
            prices[knownToken.oracleId],
            knownToken,
            unknownToken
          );

          const existingWeight = weights[unknownToken.oracleId] || 0;
          const betterPrice = weight > existingWeight;

          if (DEBUG_ORACLES.includes(unknownToken.oracleId)) {
            console.log(
              `${betterPrice ? 'Setting' : 'Skipping'} ${unknownToken.oracleId} to $${price} via ${
                knownToken.oracleId
              } ($${prices[knownToken.oracleId]}) in ${pool.name} (${
                pool.address
              }) - new weight ${weight} vs existing ${existingWeight}`
            );
          }

          if (betterPrice) {
            prices[unknownToken.oracleId] = price;
            weights[unknownToken.oracleId] = weight;
          }
        }

        unsolved.splice(i, 1);
        solving = true;
      }
    }

    if (unsolved.length > 0) {
      // actually not solved
      console.log('Unsolved pools: ');
      unsolved.forEach(pool => console.log(pool.lp0.oracleId, pool.lp1.oracleId, pool.name));
    }
  }

  for (const pool of pools) {
    const lpData = calcLpPrice(pool, prices);
    lps[pool.name] = lpData.price;
    breakdown[pool.name] = lpData;
  }

  return {
    poolPrices: sortByKeys(lps),
    tokenPrices: sortByKeys(prices),
    lpsBreakdown: sortByKeys(breakdown),
  };
};

const fetchChainPools = async (chain, pools) => {
  const multicallContract = fetchContract(MULTICALLS[chain], BeefyPriceMulticall, chain);
  let lpInfos;
  try {
    lpInfos = await Promise.all(
      chunk(
        pools.map(p => [p.address, p.lp0.address, p.lp1.address]),
        BATCH_SIZE
      ).map(batch =>
        retryPromiseWithBackOff(
          multicallContract.read.getLpInfo,
          [batch],
          'fetchAmmChainPools ' + chain
        )
      )
    );
  } catch (err) {
    console.log(err.shortMessage + ' - ' + chain);
  }

  for (let i = 0; i < pools.length; i += BATCH_SIZE) {
    const batch = lpInfos[Math.floor(i / BATCH_SIZE)];
    // if (batch.status === 'rejected') {
    //   console.error('fetchChainPools', chain, batch.reason);
    //   continue;
    // }
    // const batchValues = batch.value;

    // TODO: we need better logic for error handling
    // Merge fetched data
    for (let j = 0; j < batch.length / 3; j++) {
      pools[j + i].totalSupply = new BigNumber(batch[j * 3 + 0]?.toString());
      pools[j + i].lp0.balance = new BigNumber(batch[j * 3 + 1]?.toString());
      pools[j + i].lp1.balance = new BigNumber(batch[j * 3 + 2]?.toString());
    }
  }
};

module.exports = { fetchAmmPrices };
