import { MultiCall } from 'eth-multicall';
const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const IBalancerVault = require('../../../abis/IBalancerVault.json');
import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
const fetch = require('node-fetch');
import BigNumber from 'bignumber.js';
import { multicallAddress } from '../../../utils/web3';
import { ARBITRUM_CHAIN_ID } from '../../../constants';
import { balancerArbClient } from '../../../apollo/client';
const { getTradingFeeAprBalancer } = require('../../../utils/getTradingFeeApr');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const fetchPrice = require('../../../utils/fetchPrice');

const { getContractWithProvider } = require('../../../utils/contractHelper');
const {
  arbitrum: {
    platforms: { balancer },
  },
} = addressBook;

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
  return getApyBreakdown(poolsMap, tradingAprs, farmApys[0], liquidityProviderFee, farmApys[1]);
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
    const balVault = getContractWithProvider(IBalancerVault, balancer.router, web3);
    const tokenQtys = await balVault.methods.getPoolTokens(pool.vaultPoolId).call();

    let qty = [];
    let totalQty = new BigNumber(0);
    for (let j = 0; j < tokenQtys.balances.length; j++) {
      if (pool.composable) {
        if (pool.bptIndex == j) {
          continue;
        }
      }

      const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
      const amt = new BigNumber(tokenQtys.balances[j])
        .times(price)
        .dividedBy([pool.tokens[j].decimals]);
      totalQty = totalQty.plus(amt);
      qty.push(amt);
    }

    const response = await fetch(pool.lidoUrl).then(res => res.json());
    const apr = response.data.steth;
    pool.balancerChargesFee
      ? (aprFixed = (apr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100 / 2)
      : (aprFixed = (apr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100);
  }
  // console.log(pool.name,rewardsApy.toNumber(),totalStakedInUsd.valueOf(),yearlyRewardsInUsd.valueOf());
  return [rewardsApy, aprFixed];
};

module.exports = getBalancerArbApys;
