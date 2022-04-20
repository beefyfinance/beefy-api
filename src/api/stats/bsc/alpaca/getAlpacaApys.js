import BigNumber from 'bignumber.js';
import { bscWeb3 as web3 } from '../../../../utils/web3';

import ERC20 from '../../../../abis/ERC20.json';
import AlpacaIbVault from '../../../../abis/AlpacaIbVault.json';
import AlpacaIbVaultConfig from '../../../../abis/AlpacaIbVaultConfig.json';

import getCakeV2PoolApy from '../pancake/getCakeV2PoolApy';
import fetchPrice from '../../../../utils/fetchPrice';
import getApyBreakdown from '../../common/getApyBreakdown';
import { getContractWithProvider } from '../../../../utils/contractHelper';

const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const getYearlyRewardsInUsd = require('./getYearlyRewardsInUsd');
const pools = require('../../../../data/alpacaPools.json');

const getAlpacaApys = async () => {
  const getPools = [];
  pools.forEach(pool => getPools.push(getPoolApy(pool)));

  const getLending = [];
  pools.forEach(pool => getLending.push(getLendingApr(pool)));

  const [poolAprs, lendingAprs] = await Promise.all([
    Promise.all(getPools),
    Promise.all(getLending),
  ]);

  const tradingAprs = {};
  pools.forEach((pool, i) => {
    tradingAprs[pool.address.toLowerCase()] = lendingAprs[i];
  });

  return getApyBreakdown(pools, tradingAprs, poolAprs, 0);
};

const getPoolApy = async pool => {
  const fairLaunch = '0xA625AB01B08ce023B2a342Dbb12a16f2C8489A8F';

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(fairLaunch, pool),
    getTotalStakedInUsd(fairLaunch, pool.address, pool.oracle, pool.oracleId),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  // console.log(pool.name, 'pool apr', simpleApy.toNumber());
  return simpleApy;
};

const getLendingApr = async pool => {
  const ibToken = getContractWithProvider(AlpacaIbVault, pool.address, web3);
  let [totalToken, vaultDebtVal, reservePool, configAddress] = await Promise.all([
    ibToken.methods.totalToken().call(),
    ibToken.methods.vaultDebtVal().call(),
    ibToken.methods.reservePool().call(),
    ibToken.methods.config().call(),
  ]);
  totalToken = new BigNumber(totalToken);
  vaultDebtVal = new BigNumber(vaultDebtVal);

  const utilization = vaultDebtVal.div(totalToken);
  const floating = totalToken.minus(vaultDebtVal).plus(new BigNumber(reservePool));

  const config = getContractWithProvider(AlpacaIbVaultConfig, configAddress, web3);
  const rate = new BigNumber(await config.methods.getInterestRate(vaultDebtVal, floating).call());
  const lendingApr = rate.times(31536000).times(0.81).times(utilization).div('1e18');
  // console.log(pool.name, 'lending apr', lendingApr.toNumber());

  let protocolApr = new BigNumber(0);
  if (pool.workers) {
    const cakeApy = (await getCakeV2PoolApy())['cake-cakev2'];
    const cakeApr = calcApr(cakeApy) / 0.99;

    const syrup = '0x009cf7bc57584b7998236eff51b98a168dcea9b0';
    const tokenContract = getContractWithProvider(ERC20, syrup, web3);
    let promises = [];
    pool.workers.forEach(worker => promises.push(tokenContract.methods.balanceOf(worker).call()));
    const values = await Promise.all(promises);

    let totalCakes = new BigNumber(0);
    for (const v of values) {
      totalCakes = totalCakes.plus(new BigNumber(v));
    }
    const cakePrice = await fetchPrice({ oracle: 'tokens', id: 'Cake' });
    const cakeRewardInUsd = totalCakes
      .times(cakePrice)
      .times(cakeApr)
      .times(0.19)
      .times(10)
      .div(19)
      .div('1e18');

    const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'ALPACA' });
    const totalSupplyInUsd = totalToken.times(tokenPrice).div('1e18');

    protocolApr = cakeRewardInUsd.div(totalSupplyInUsd);
    // console.log('protocol apr', protocolApr.toNumber());
  }

  return lendingApr.plus(protocolApr);
};

export const calcApr = apy => {
  return (Math.pow(10, Math.log10(apy + 1) / 365) - 1) * 365;
};

module.exports = getAlpacaApys;
