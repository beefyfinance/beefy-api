import { getRewardPoolApys } from '../getRewardPoolApys';
import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../../utils/web3';
import { getContractWithProvider } from '../../../../utils/contractHelper';
import BigNumber from 'bignumber.js';
import { getTradingFeeAprHop } from '../../../../utils/getTradingFeeApr';

const ERC20 = require('../../../../abis/common/ERC20/ERC20.json');
const IStableSwap = require('../../../../abis/IStableSwap.json');

export const getHopCommonApys = async params => {
  params.tradingAprs = await getTradingAprs(params);
  return await getRewardPoolApys(params);
};

const getTradingAprs = async params => {
  const tvls = await getTvl(params);
  const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
  const tokens = params.pools.map(pool => pool.tokens[0].address);
  const aprs = await getTradingFeeAprHop(
    params.client,
    pairAddresses,
    tokens,
    tvls,
    params.liquidityProviderFee
  );
  return aprs;
};

const getTvl = async params => {
  const multicall = new MultiCall(params.web3, multicallAddress(params.chainId));
  const lpCalls = [];
  const poolCalls = [];
  params.pools.forEach(pool => {
    const lpContract = getContractWithProvider(ERC20, pool.address, params.web3);
    const poolContract = getContractWithProvider(IStableSwap, pool.pool, params.web3);
    lpCalls.push({
      totalSupply: lpContract.methods.totalSupply(),
    });
    poolCalls.push({
      virtualPrice: poolContract.methods.getVirtualPrice(),
    });
  });

  const res = await multicall.all([lpCalls, poolCalls]);

  const totalSupplys = res[0].map(v => new BigNumber(v.totalSupply));
  const virtualPrices = res[1].map(v => new BigNumber(v.virtualPrice));

  const tvls = [];
  let i = 0;
  for (const pool of params.pools) {
    tvls.push(
      totalSupplys[i].times(virtualPrices[i]).times(pool.virtualDecimals).dividedBy('1e36')
    );
    ++i;
  }

  return tvls;
};

module.exports = { getHopCommonApys };
