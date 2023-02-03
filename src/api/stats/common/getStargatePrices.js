import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';
import StargateLP from '../../../abis/StargateLP.json';
const { getContractWithProvider } = require('../../../utils/contractHelper');

const getStargatePrices = async (web3, chainId, pools, tokenPrices) => {
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const tokenCalls = [];

  pools.forEach(pool => {
    const tokenContract = getContractWithProvider(StargateLP, pool.address, web3);
    tokenCalls.push({
      stakedInsPool: tokenContract.methods.totalLiquidity(),
      totalsSupply: tokenContract.methods.totalSupply(),
    });
  });

  const res = await multicall.all([tokenCalls]);

  const stakedInsPool = res[0].map(v => new BigNumber(v.stakedInsPool));
  const totalsSupply = res[0].map(v => new BigNumber(v.totalsSupply));

  let prices = {};

  for (let i = 0; i < pools.length; i++) {
    const price = stakedInsPool[i]
      .times(tokenPrices[pools[i].underlying])
      .dividedBy(totalsSupply[i]).toNumber();

    prices = {...prices, [pools[i].name]: price };
  };

  return prices;
};

module.exports = getStargatePrices;
