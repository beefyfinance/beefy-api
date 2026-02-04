import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../common/balancer/balancerUtils';
import getApyBreakdown from '../common/getApyBreakdown';
import BigNumber from 'bignumber.js';
import { OPTIMISM_CHAIN_ID } from '../../../constants';
import { beetOpClient } from '../../../apollo/client';
const { getTradingFeeAprBalancer } = require('../../../utils/getTradingFeeApr');
import { addressBook } from '../../../../packages/address-book/src/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
import IBalancerVault from '../../../abis/IBalancerVault';
import { fetchContract } from '../../rpc/client';
import { fetchPrice } from '../../../utils/fetchPrice';

const {
  optimism: {
    platforms: { beethovenX },
  },
} = addressBook;

const pools = require('../../../data/optimism/beethovenxLpPools.json');

const liquidityProviderFee = 0.0075;

const getBeetsOpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeAprBalancer(beetOpClient, pairAddresses, liquidityProviderFee, 10),
    getPoolApys(pools),
  ]);

  // console.log(tradingAprs);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.address }));
  return getApyBreakdown(poolsMap, tradingAprs, farmApys[0], liquidityProviderFee, farmApys[1], farmApys[2]);
};

const getPoolApys = async pools => {
  const apys = [];
  const lsAprs = [];
  const csAprs = [];

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);
  values.forEach(item => {
    apys.push(item[0]);
    lsAprs.push(item[1]);
    csAprs.push(item[2]);
  });

  return [apys, lsAprs, csAprs];
};

const getPoolApy = async pool => {
  if (pool.status === 'eol') return new BigNumber(0);
  const [yearlyRewardsInUsd, totalStakedInUsd, extraData] = await Promise.all([
    getYearlyRewardsInUsd(OPTIMISM_CHAIN_ID, pool),
    getTotalStakedInUsd(OPTIMISM_CHAIN_ID, pool),
    getPoolExtraData(pool),
  ]);

  //console.log(pool.name, yearlyRewardsInUsd.toNumber(), totalStakedInUsd.toNumber())
  let rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  let aprFixed = 0;
  let compAprFixed = 0;

  if (pool.lidoUrl) {
    const tokenQtys = extraData.lido[0];

    let qty = [];
    let totalQty = new BigNumber(0);
    for (let j = 0; j < tokenQtys[1].length; j++) {
      if (pool.composable) {
        if (pool.bptIndex == j) {
          continue;
        }
      }

      const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
      const amt = new BigNumber(tokenQtys[1][j]).times(price).dividedBy([pool.tokens[j].decimals]);
      totalQty = totalQty.plus(amt);
      qty.push(amt);
    }
    const response = extraData.lido[1];
    const apr = response.data.smaApr;

    pool.balancerChargesFee
      ? (aprFixed = (apr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100 / 2)
      : (aprFixed = (apr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100);
  }

  //console.log(pool.name, aprFixed, compAprFixed);
  return [rewardsApy, aprFixed, compAprFixed];
};

const getPoolExtraData = async pool => {
  const lidoCalls = [];
  const balVault = fetchContract(beethovenX.router, IBalancerVault, OPTIMISM_CHAIN_ID);
  if (pool.lidoUrl) {
    lidoCalls.push(balVault.read.getPoolTokens([pool.vaultPoolId]));
    lidoCalls.push(fetch(pool.lidoUrl).then(res => res.json()));
  }
  const [lidoResults] = await Promise.all([Promise.all(lidoCalls)]);
  let response = {};
  if (pool.lidoUrl) response.lido = lidoResults;
  return response;
};

module.exports = getBeetsOpApys;
