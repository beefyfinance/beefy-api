import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import ISolarStablePool from '../../../abis/moonriver/ISolarStablePool.json';
import { moonriverWeb3 as web3, multicallAddress } from '../../../utils/web3';
import { MOONRIVER_CHAIN_ID as chainId } from '../../../constants';
import { getContract } from '../../../utils/contractHelper';
import pools from '../../../data/moonriver/solarbeamStablePools.json';

const DECIMALS = '1e18';

const getSolarbeamPrices = async tokenPrices => {
  let prices = {};

  const virtualPrices = await getVirtualPrice(tokenPrices);

  for (let i = 0; i < pools.length; i++) {
    const tokenPrice = getTokenPrice(tokenPrices, pools[i].virtualOracleId);
    const price = virtualPrices[i].multipliedBy(tokenPrice).dividedBy(DECIMALS).toNumber();
    prices = { ...prices, [pools[i].name]: price };
  }

  return prices;
};

const getVirtualPrice = async tokenPrices => {
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  let virtualPriceCalls = [];

  for (let i = 0; i < pools.length; i++) {
    const lpContract = getContract(ISolarStablePool, pools[i].pool);
    virtualPriceCalls.push({
      virtualPrice: lpContract.methods.getVirtualPrice(),
    });
  }

  const res = await multicall.all([virtualPriceCalls]);
  const virtualPrices = res[0].map(v => new BigNumber(v.virtualPrice));

  return virtualPrices;
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

export default getSolarbeamPrices;
