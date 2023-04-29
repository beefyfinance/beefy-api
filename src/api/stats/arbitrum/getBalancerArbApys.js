import { MultiCall } from 'eth-multicall';
const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const IBalancerVault = require('../../../abis/IBalancerVault.json');
const IAaveProtocolDataProvider = require('../../../abis/matic/AaveProtocolDataProvider.json');
import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
const fetch = require('node-fetch');
import BigNumber from 'bignumber.js';
import { multicallAddress } from '../../../utils/web3';
import { ARBITRUM_CHAIN_ID } from '../../../constants';
import { balancerArbClient as client } from '../../../apollo/client';
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
const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';
const RAY_DECIMALS = '1e27';

const getBalancerArbApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprBalancer(
    client,
    pairAddresses,
    liquidityProviderFee,
    chainId
  );

  // console.log(tradingAprs);

  const farmApys = await getPoolApys(pools);
  return getApyBreakdown(
    pools,
    tradingAprs,
    farmApys[0],
    liquidityProviderFee,
    farmApys[1],
    farmApys[2]
  );
};

const getPoolApys = async pools => {
  const apys = [];
  const lsAprs = [];
  const cmpAprs = [];

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);
  values.forEach(item => {
    apys.push(item[0]);
    lsAprs.push(item[1]);
    cmpAprs.push(item[2].toNumber());
  });

  return [apys, lsAprs, cmpAprs];
};

const getPoolApy = async pool => {
  if (pool.status === 'eol') return new BigNumber(0);
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(chainId)), pool),
    getTotalStakedInUsd(web3, pool),
  ]);

  let rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  let aprFixed = 0;
  if (pool.lidoUrl || pool.rocketUrl) {
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

    if (pool.lidoUrl) {
      const response = await fetch(pool.lidoUrl).then(res => res.json());
      const apr = response.data.steth;
      pool.balancerChargesFee
        ? (aprFixed = (apr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100 / 2)
        : (aprFixed = (apr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100);
    } else if (pool.rocketUrl) {
      const response = await fetch(pool.rocketUrl).then(res => res.json());
      const apr = response.yearlyAPR;

      pool.balancerChargesFee
        ? (aprFixed = (apr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100 / 2)
        : (aprFixed = (apr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100);
    }
  }

  let composableApr = new BigNumber(0);
  if (pool.includesComposableAaveTokens) {
    let bbAaveApy = await getComposableAaveYield(pool.aaveUnderlying, pool.bbPoolId, pool.bbIndex);
    if (pool.composableSplit) {
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

      composableApr = bbAaveApy.times(qty[pool.lsIndex].dividedBy(totalQty));
    } else {
      composableApr = bbAaveApy;
    }
  }
  // console.log(pool.name, rewardsApy.toNumber(),totalStakedInUsd.valueOf(),yearlyRewardsInUsd.valueOf());
  return [rewardsApy, aprFixed, composableApr];
};

const getComposableAaveYield = async (tokens, poolId, index) => {
  let supplyRateCalls = [];
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  tokens.forEach(t => {
    const dataProvider = getContractWithProvider(IAaveProtocolDataProvider, aaveDataProvider, web3);
    supplyRateCalls.push({ supplyRate: dataProvider.methods.getReserveData(t.address) });
  });

  const res = await multicall.all([supplyRateCalls]);

  const rates = res[0].map(v => new BigNumber(v.supplyRate[5]));

  const balVault = getContractWithProvider(IBalancerVault, balancer.router, web3);
  const tokenQtys = await balVault.methods.getPoolTokens(poolId).call();

  let qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys.balances.length; j++) {
    if (j != index) {
      totalQty = totalQty.plus(new BigNumber(tokenQtys.balances[j]));
      qty.push(new BigNumber(tokenQtys.balances[j]));
    }
  }

  let apy = new BigNumber(0);
  for (let i = 0; i < tokens.length; i++) {
    const tokenApy = new BigNumber(rates[i]).div(RAY_DECIMALS);
    const portionedApy = tokenApy.dividedBy(2).times(qty[i]).dividedBy(totalQty);
    apy = apy.plus(portionedApy);
    //console.log(bbaUSDTokens[i].address, portionedApy.toNumber());
  }
  return apy;
};

module.exports = getBalancerArbApys;
