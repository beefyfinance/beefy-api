import { parseAbi } from 'viem';

const BigNumber = require('bignumber.js');
const { fetchContract } = require('../../../rpc/client');
const { default: ERC20Abi } = require('../../../../abis/ERC20Abi');

const ICurveVault = parseAbi(['function pricePerShare() view returns (uint)']);

export const getCurveLendPricesCommon = async (chainId, pools, tokenPrices) => {
  let prices = {};

  const ppsCalls = pools.map(pool =>
    fetchContract(pool.address, ICurveVault, chainId).read.pricePerShare()
  );
  const supplyCalls = pools.map(pool =>
    fetchContract(pool.address, ERC20Abi, chainId).read.totalSupply()
  );
  const [ppsRes, supplyRes] = await Promise.all([Promise.all(ppsCalls), Promise.all(supplyCalls)]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const pps = new BigNumber(ppsRes[i]).div('1e18');
    const tokenPrice = getTokenPrice(tokenPrices, pool.oracleId);
    const price = pps.times(tokenPrice).toNumber();
    const totalSupply = new BigNumber(supplyRes[i]).div('1e18').toString(10);
    prices[pool.name] = {
      price,
      totalSupply,
      tokens: [],
      balances: [],
    };
  }
  return prices;
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) {
    console.error('Curve lend prices oracleId is not defined', oracleId);
    return 1;
  }
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(
      `Curve lend prices unknown token '${tokenSymbol}'. Consider adding it to .json file`
    );
  }
  return tokenPrice;
};
