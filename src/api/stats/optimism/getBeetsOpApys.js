import { MultiCall } from 'eth-multicall';
const { optimismWeb3: web3 } = require('../../../utils/web3');
import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import BigNumber from 'bignumber.js';
import getBlockNumber from '../../../utils/getBlockNumber';
import { multicallAddress } from '../../../utils/web3';
import { OPTIMISM_CHAIN_ID } from '../../../constants';
import { beetOpClient } from '../../../apollo/client';
import getBlockNumber from '../../../utils/getBlockNumber';
const { getTradingFeeAprBalancer } = require('../../../utils/getTradingFeeApr');

const pools = require('../../../data/optimism/beethovenxLpPools.json');

const liquidityProviderFee = 0.0075;

const getBeetsOpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprBalancer(
    beetOpClient,
    pairAddresses,
    liquidityProviderFee,
    10
  );

  console.log(tradingAprs);

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
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(OPTIMISM_CHAIN_ID)), pool),
    getTotalStakedInUsd(web3, pool),
  ]);
  const rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  console.log(
    pool.name,
    rewardsApy.toNumber(),
    totalStakedInUsd.valueOf(),
    yearlyRewardsInUsd.valueOf()
  );
  return rewardsApy;
};

module.exports = getBeetsOpApys;
