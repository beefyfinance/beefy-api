import { MultiCall } from 'eth-multicall';
const { polygonWeb3: web3 } = require('../../../utils/web3');
import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
const { getContractWithProvider } = require('../../../utils/contractHelper');
const IAaveProtocolDataProvider = require('../../../abis/matic/AaveProtocolDataProvider.json');
const IBalancerVault = require('../../../abis/IBalancerVault.json');
import { multicallAddress } from '../../../utils/web3';
import BigNumber from 'bignumber.js';
import { multicallAddress } from '../../../utils/web3';
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const { balancerPolyClient: client } = require('../../../apollo/client');
const fetch = require('node-fetch');
const { getTradingFeeAprBalancer } = require('../../../utils/getTradingFeeApr');
const fetchPrice = require('../../../utils/fetchPrice');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  polygon: {
    tokens: { DAI, USDC, USDT },
    platforms: { balancer },
  },
} = addressBook;

const bbaUSDTokens = [
  {
    address: USDT.address,
  },
  {
    address: USDC.address,
  },
  {
    address: DAI.address,
  },
];

const pools = require('../../../data/matic/balancerPolyLpPools.json');

const liquidityProviderFee = 0.0025;
const aaveDataProvider = '0x7551b5D2763519d4e37e8B81929D336De671d46d';
const bbaUSDPoolId = '0x48e6b98ef6329f8f0a30ebb8c7c960330d64808500000000000000000000075b';
const RAY_DECIMALS = '1e27';

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
  if (pool.lidoUrl) {
    const response = await fetch(pool.lidoUrl).then(res => res.json());
    const apr = response.apr;
    pool.balancerChargesFee ? (aprFixed = apr / 100 / 4) : (aprFixed = apr / 100 / 2);
  } else if (pool.staderUrl) {
    const response = await fetch(pool.staderUrl).then(res => res.json());
    const apr = response.value;
    pool.balancerChargesFee ? (aprFixed = apr / 100 / 4) : (aprFixed = apr / 100 / 2);
  }

  let bbaUSDApy = await getComposableAaveYield();
  let composableApr = new BigNumber(0);
  if (pool.includesComposableStable) {
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

      composableApr = bbaUSDApy.times(qty[pool.lsIndex].dividedBy(totalQty));
    } else {
      composableApr = bbaUSDApy;
    }
  }
  // console.log(pool.name, rewardsApy.toNumber(),totalStakedInUsd.valueOf(),yearlyRewardsInUsd.valueOf());
  return [rewardsApy, aprFixed, composableApr];
};

const getComposableAaveYield = async () => {
  let supplyRateCalls = [];
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  bbaUSDTokens.forEach(t => {
    const dataProvider = getContractWithProvider(IAaveProtocolDataProvider, aaveDataProvider, web3);
    supplyRateCalls.push({ supplyRate: dataProvider.methods.getReserveData(t.address) });
  });

  const res = await multicall.all([supplyRateCalls]);

  const rates = res[0].map(v => new BigNumber(v.supplyRate[3]));

  const balVault = getContractWithProvider(IBalancerVault, balancer.router, web3);
  const tokenQtys = await balVault.methods.getPoolTokens(bbaUSDPoolId).call();

  let qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys.balances.length; j++) {
    if (j != 2) {
      totalQty = totalQty.plus(new BigNumber(tokenQtys.balances[j]));
      qty.push(new BigNumber(tokenQtys.balances[j]));
    }
  }

  let apy = new BigNumber(0);
  for (let i = 0; i < bbaUSDTokens.length; i++) {
    const tokenApy = new BigNumber(rates[i]).div(RAY_DECIMALS);
    const portionedApy = tokenApy.dividedBy(2).times(qty[i]).dividedBy(totalQty);
    apy = apy.plus(portionedApy);
    //console.log(bbaUSDTokens[i].address, portionedApy.toNumber());
  }
  return apy;
};

module.exports = getBalancerPolyApys;
