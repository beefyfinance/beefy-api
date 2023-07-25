import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import BigNumber from 'bignumber.js';
import { OPTIMISM_CHAIN_ID } from '../../../constants';
import { beetOpClient } from '../../../apollo/client';
const { getTradingFeeAprBalancer } = require('../../../utils/getTradingFeeApr');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
import IBalancerVault from '../../../abis/IBalancerVault';
import { fetchContract } from '../../rpc/client';
const fetchPrice = require('../../../utils/fetchPrice');

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
  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeAprBalancer(beetOpClient, pairAddresses, liquidityProviderFee, 10),
    getPoolApys(pools),
  ]);

  // console.log(tradingAprs);
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

  if (pool.overnight) {
    const usdPlusTokenQtys = extraData.overnight[0];
    const daiPlusTokenQtys = extraData.overnight[1];

    let usdQty = [];
    let usdTotalQty = new BigNumber(0);
    for (let i = 0; i < usdPlusTokenQtys[1].length; i++) {
      if (i != 1) {
        const price = await fetchPrice({ oracle: 'tokens', id: bbUsdPlusTokens[i].symbol });
        const amt = new BigNumber(usdPlusTokenQtys[1][i])
          .times(price)
          .dividedBy(getEDecimals(bbUsdPlusTokens[i].decimals));
        usdTotalQty = usdTotalQty.plus(amt);
        usdQty.push(amt);
        //console.log(price, amt.toString(), await getEDecimals(bbUsdPlusTokens[i].decimals));
      }
    }

    let daiQty = [];
    let daiTotalQty = new BigNumber(0);
    for (let j = 0; j < daiPlusTokenQtys[1].length; j++) {
      if (j != 1) {
        const price = await fetchPrice({ oracle: 'tokens', id: bbDaiPlusTokens[j].symbol });
        const amt = new BigNumber(daiPlusTokenQtys[1][j])
          .times(price)
          .dividedBy(getEDecimals(bbDaiPlusTokens[j].decimals));
        daiTotalQty = daiTotalQty.plus(amt);
        daiQty.push(amt);
      }
    }

    try {
      const usdPlusResponse = extraData.overnight[2];
      const usdPlusApr = usdPlusResponse.value;

      const usdPlusFixed = (usdPlusApr * usdQty[1].dividedBy(usdTotalQty).toNumber()) / 100 / 2 / 2;

      const daiPlusResponse = extraData.overnight[3];
      const daiPlusApr = daiPlusResponse.value;

      //  console.log(daiPlusResponse);

      const daiPlusFixed = (daiPlusApr * daiQty[0].dividedBy(daiTotalQty).toNumber()) / 100 / 2 / 2;

      // console.log(pool.name, usdPlusFixed, daiPlusFixed);
      compAprFixed = usdPlusFixed + daiPlusFixed;
    } catch (e) {
      console.error(`Overnight APR error`, e);
    }
  }
  //console.log(pool.name, aprFixed, compAprFixed);
  return [rewardsApy, aprFixed, compAprFixed];
};

const getPoolExtraData = async pool => {
  const overnightCalls = [];
  const lidoCalls = [];
  const balVault = fetchContract(beethovenX.router, IBalancerVault, OPTIMISM_CHAIN_ID);
  if (pool.overnight) {
    overnightCalls.push(balVault.read.getPoolTokens([bbUsdPlusPoolId]));
    overnightCalls.push(balVault.read.getPoolTokens([bbDaiPlusPoolId]));
    overnightCalls.push(
      fetch('https://api.overnight.fi/optimism/usd+/fin-data/avg-apr/week').then(res => res.json())
    );
    overnightCalls.push(
      fetch('https://api.overnight.fi/optimism/dai+/fin-data/avg-apr/week').then(res => res.json())
    );
  }
  if (pool.lidoUrl) {
    lidoCalls.push(balVault.read.getPoolTokens([pool.vaultPoolId]));
    lidoCalls.push(fetch(pool.lidoUrl).then(res => res.json()));
  }
  const [lidoResults, overnightResults] = await Promise.all([
    Promise.all(lidoCalls),
    Promise.all(overnightCalls),
  ]);
  let response = {};
  if (pool.overnight) response.overnight = overnightResults;
  if (pool.lidoUrl) response.lido = lidoResults;
  return response;
};

module.exports = getBeetsOpApys;
