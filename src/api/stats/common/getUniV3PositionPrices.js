const BigNumber = require('bignumber.js');
import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';

const Helper = require('../../../abis/BeefyUniswapPositionHelper.json');
const { getContract } = require('../../../utils/contractHelper');

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
  const price = lp0.plus(lp1).multipliedBy(1e18).dividedBy(liquidity).toNumber();

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
  const multicall = new MultiCall(params.web3, multicallAddress(params.chainId));
  let calls = [];
  const beefyHelperContract = getContract(Helper, params.beefyHelper);
  params.pools.forEach(pool => {
    calls.push({
      tokens: beefyHelperContract.methods.getPositionTokens(pool.nftId, pool.address),
    });
  });

  const res = await multicall.all([calls]);

  const positionTokens = res[0].map(v => v.tokens);

  return positionTokens;
};

module.exports = getUniV3PositionPrices;
