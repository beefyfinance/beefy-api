import { MultiCall } from 'eth-multicall';
const { arbitrumWeb3: web3 } = require('../../../utils/web3');
import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
const fetch = require('node-fetch');
import BigNumber from 'bignumber.js';
import { multicallAddress } from '../../../utils/web3';
import { ARBITRUM_CHAIN_ID } from '../../../constants';
import { balancerArbClient } from '../../../apollo/client';
const { getTradingFeeAprBalancer } = require('../../../utils/getTradingFeeApr');

const pools = require('../../../data/arbitrum/balancerArbLpPools.json');
const chainId = ARBITRUM_CHAIN_ID;

const liquidityProviderFee = 0.0025;

const getBalancerArbApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprBalancer(
    balancerArbClient,
    pairAddresses,
    liquidityProviderFee,
    chainId
  );

  // console.log(tradingAprs);

  const farmApys = await getPoolApys(pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.address }));
  return getApyBreakdown(poolsMap, tradingAprs, farmApys, liquidityProviderFee);
};

const getPoolApys = async pools => {
  const apys = [];

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);
  values.forEach(item => apys.push(item));

  return apys;
};

const getPoolApy = async pool => {
  if (pool.status === 'eol') return new BigNumber(0);
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(chainId)), pool),
    getTotalStakedInUsd(web3, pool),
  ]);
  let rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  if (pool.lidoUrl) {
    const response = await fetch(pool.lidoUrl).then(res => res.json());
    const apr = response.data.steth;
    let aprFixed = 0;
    pool.metaStable ? (aprFixed = apr / 100 / 4) : (aprFixed = apr / 100 / 2);
    rewardsApy = rewardsApy.plus(aprFixed);
  }
  // console.log(pool.name,rewardsApy.toNumber(),totalStakedInUsd.valueOf(),yearlyRewardsInUsd.valueOf());
  return rewardsApy;
};

module.exports = getBalancerArbApys;
