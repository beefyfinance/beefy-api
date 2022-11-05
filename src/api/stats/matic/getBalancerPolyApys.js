import { MultiCall } from 'eth-multicall';
const { polygonWeb3: web3 } = require('../../../utils/web3');
import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import BigNumber from 'bignumber.js';
import { multicallAddress } from '../../../utils/web3';
import { lastDayOfQuarterWithOptions } from 'date-fns/fp';
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const { balancerPolyClient: client } = require('../../../apollo/client');
const fetch = require('node-fetch');
const { getTradingFeeAprBalancer } = require('../../../utils/getTradingFeeApr');

const pools = require('../../../data/matic/balancerPolyLpPools.json');

const liquidityProviderFee = 0.0025;

const getBalancerPolyApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprBalancer(
    client,
    pairAddresses,
    liquidityProviderFee,
    chainId
  );

  // console.log(tradingAprs);

  const farmApys = await getPoolApys(pools);
  return getApyBreakdown(pools, tradingAprs, farmApys[0], liquidityProviderFee, farmApys[1]);
};

const getPoolApys = async pools => {
  const apys = [];
  const lsAprs = [];

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);
  values.forEach(item => {
    apys.push(item[0]);
    lsAprs.push(item[1]);
  });

  return [apys, lsAprs];
};

const getPoolApy = async pool => {
  if (pool.status === 'eol') return new BigNumber(0);
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(chainId)), pool),
    getTotalStakedInUsd(web3, pool),
  ]);
  let rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  let aprFixed = 0;
  if (pool.lidoUrl) {
    const response = await fetch(pool.lidoUrl).then(res => res.json());
    const apr = response.apr;
    pool.balancerChargesFee ? (aprFixed = apr / 100 / 4) : (aprFixed = apr / 100 / 2);
  }
  // console.log(pool.name,rewardsApy.toNumber(),totalStakedInUsd.valueOf(),yearlyRewardsInUsd.valueOf());
  return [rewardsApy, aprFixed];
};

module.exports = getBalancerPolyApys;
