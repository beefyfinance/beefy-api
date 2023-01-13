import { MultiCall } from 'eth-multicall';
const { optimismWeb3: web3 } = require('../../../utils/web3');
import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
const IBalancerVault = require('../../../abis/IBalancerVault.json');
import BigNumber from 'bignumber.js';
import { multicallAddress } from '../../../utils/web3';
import { OPTIMISM_CHAIN_ID } from '../../../constants';
const fetch = require('node-fetch');
import { beetOpClient } from '../../../apollo/client';
const { getTradingFeeAprBalancer } = require('../../../utils/getTradingFeeApr');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const fetchPrice = require('../../../utils/fetchPrice');

const { getContractWithProvider } = require('../../../utils/contractHelper');
const {
  optimism: {
    tokens: { USDC, 'wUSD+': wUSDplus, DAI, 'wDAI+': wDAIplus },
    platforms: { beethovenX },
  },
} = addressBook;

const bbUsdPlusPoolId = '0x88d07558470484c03d3bb44c3ecc36cafcf43253000000000000000000000051';
const bbDaiPlusPoolId = '0xb5ad7d6d6f92a77f47f98c28c84893fbccc9480900000000000000000000006c';
const bbUsdPlusTokens = [USDC, USDC, wUSDplus];
const bbDaiPlusTokens = [DAI, DAI, wDAIplus];

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

  // console.log(tradingAprs);
  const farmApys = await getPoolApys(pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.address }));
  return getApyBreakdown(
    poolsMap,
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
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(OPTIMISM_CHAIN_ID)), pool),
    getTotalStakedInUsd(web3, pool),
  ]);
  let rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  let aprFixed = 0;
  let compAprFixed = 0;
  if (pool.lidoUrl) {
    const balVault = getContractWithProvider(IBalancerVault, beethovenX.router, web3);
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

  if (pool.overnight) {
    const balVault = getContractWithProvider(IBalancerVault, beethovenX.router, web3);
    const usdPlusTokenQtys = await balVault.methods.getPoolTokens(bbUsdPlusPoolId).call();
    const daiPlusTokenQtys = await balVault.methods.getPoolTokens(bbDaiPlusPoolId).call();

    let usdQty = [];
    let usdTotalQty = new BigNumber(0);
    for (let i = 0; i < usdPlusTokenQtys.balances.length; i++) {
      if (i != 1) {
        const price = await fetchPrice({ oracle: 'tokens', id: bbUsdPlusTokens[i].symbol });
        const amt = new BigNumber(usdPlusTokenQtys.balances[i])
          .times(price)
          .dividedBy(await getEDecimals(bbUsdPlusTokens[i].decimals));
        usdTotalQty = usdTotalQty.plus(amt);
        usdQty.push(amt);
        //console.log(price, amt.toString(), await getEDecimals(bbUsdPlusTokens[i].decimals));
      }
    }

    let daiQty = [];
    let daiTotalQty = new BigNumber(0);
    for (let j = 0; j < daiPlusTokenQtys.balances.length; j++) {
      if (j != 1) {
        const price = await fetchPrice({ oracle: 'tokens', id: bbDaiPlusTokens[j].symbol });
        const amt = new BigNumber(daiPlusTokenQtys.balances[j])
          .times(price)
          .dividedBy(await getEDecimals(bbDaiPlusTokens[j].decimals));
        daiTotalQty = daiTotalQty.plus(amt);
        daiQty.push(amt);
      }
    }

    try {
      const usdPlusResponse = await fetch(
        'https://api.overnight.fi/optimism/usd+/fin-data/avg-apr/week'
      ).then(res => res.json());
      const usdPlusApr = usdPlusResponse.value;

      const usdPlusFixed = (usdPlusApr * usdQty[1].dividedBy(usdTotalQty).toNumber()) / 100 / 2;

      const daiPlusResponse = await fetch(
        'https://api.overnight.fi/optimism/dai+/fin-data/avg-apr/week'
      ).then(res2 => res2.json());
      const daiPlusApr = daiPlusResponse.value;

      //  console.log(daiPlusResponse);

      const daiPlusFixed = (daiPlusApr * daiQty[0].dividedBy(daiTotalQty).toNumber()) / 100 / 2;

      // console.log(pool.name, usdPlusFixed, daiPlusFixed);
      compAprFixed = usdPlusFixed + daiPlusFixed;
    } catch (e) {
      console.error(`Overnight APR error`, e);
    }
  }
  // console.log(pool.name, aprFixed, compAprFixed);
  return [rewardsApy, aprFixed, compAprFixed];
};

module.exports = getBeetsOpApys;
