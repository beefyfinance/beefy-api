const BigNumber = require('bignumber.js');
import { fetchContract } from '../../rpc/client';
import BeefyUniswapPositionHelperAbi from '../../../abis/BeefyUniswapPositionHelper';

const getUniV3PositionPrices = async params => {
  let prices = {};

  const positionTokens = await getPoolData(params);

  for (let i = 0; i < params.pools.length; i++) {
    let price = await getPrice(params.pools[i], positionTokens[i], params.tokenPrices);
    prices = { ...prices, ...price };
  }

  return prices;
};

const getPrice = async (pool, positionTokens, tokenPrices) => {
  const lp0Bal = new BigNumber(positionTokens[0]);
  const lp1Bal = new BigNumber(positionTokens[1]);
  const liquidity = new BigNumber(positionTokens[2]);

  const lp0 = lp0Bal.multipliedBy(tokenPrices[pool.lp0.oracleId]).dividedBy(pool.lp0.decimals);
  const lp1 = lp1Bal.multipliedBy(tokenPrices[pool.lp1.oracleId]).dividedBy(pool.lp1.decimals);
  const price = liquidity.eq(0)
    ? 0
    : lp0.plus(lp1).multipliedBy(1e18).dividedBy(liquidity).toNumber();

  return {
    [pool.name]: {
      price,
      tokens: [pool.lp0.address, pool.lp1.address],
      balances: [
        lp0Bal.dividedBy(pool.lp0.decimals).toString(10),
        lp1Bal.dividedBy(pool.lp1.decimals).toString(10),
      ],
      totalSupply: liquidity.dividedBy(1e18).toString(10),
    },
  };
};

const getPoolData = async params => {
  const beefyHelperContract = fetchContract(
    params.beefyHelper,
    BeefyUniswapPositionHelperAbi,
    params.chainId
  );
  const calls = params.pools.map(pool =>
    beefyHelperContract.read.getPositionTokens([pool.nftId, pool.address, params.nftManager])
  );
  return await Promise.all(calls);
};

module.exports = getUniV3PositionPrices;
