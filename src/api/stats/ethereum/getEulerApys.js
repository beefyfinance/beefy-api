const BigNumber = require('bignumber.js');

import { fetchPrice } from '../../../utils/fetchPrice';
const { compound } = require('../../../utils/compound');
import { ETH_CHAIN_ID, ETH_HPY } from '../../../constants';
import IETokenAbi from '../../../abis/ethereum/IEToken';
import IRewardPool from '../../../abis/IRewardPool';
import IMarkets from '../../../abis/ethereum/IMarkets';
import { fetchContract } from '../../rpc/client';
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');

const pools = require('../../../data/ethereum/eulerPools.json');
const markets = '0x3520d5a913427E6F0D6A83E07ccD4A4da316e4d3';
const SECONDS_PER_YEAR = 31536000;

const getEulerApys = async () => {
  let apys = {};

  const { supplyRates, rewardRates, totalSupplys, exchangeRates } = await getData(pools);

  for (let i = 0; i < pools.length; i++) {
    const apy = await getPoolApy(
      supplyRates[i],
      rewardRates[i],
      totalSupplys[i],
      exchangeRates[i],
      pools[i]
    );

    apys = { ...apys, ...apy };
  }

  return apys;
};

const getPoolApy = async (supplyRate, rewardRate, totalSupply, exchangeRateStored, pool) => {
  let [rewardPrice, tokenPrice] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'EUL' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
  ]);

  const supplyApyPerYear = supplyRate.times(SECONDS_PER_YEAR).dividedBy('1e27');

  const rewardPerYear = rewardRate.times(SECONDS_PER_YEAR).dividedBy('1e18');
  const rewardPerYearInUsd = rewardPerYear.times(rewardPrice);

  const totalSupplied = totalSupply.times(exchangeRateStored).div(pool.underlyingDecimals);
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  const apr = rewardPerYearInUsd.dividedBy(totalSuppliedInUsd);

  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(pool.name);
  let apy = compound(apr, ETH_HPY, 1, shareAfterBeefyPerformanceFee) + supplyApyPerYear.toNumber();

  // console.log(pool.name, apy)
  return { [pool.name]: apy };
};

const getData = async pools => {
  const supplyRateCalls = [];
  const rewardRateCalls = [];
  const totalSupplyCalls = [];
  const exchangeRateCalls = [];
  const marketsContract = fetchContract(markets, IMarkets, ETH_CHAIN_ID);
  pools.forEach(pool => {
    const rewardContract = fetchContract(pool.rewardPool, IRewardPool, ETH_CHAIN_ID);
    const etokenContract = fetchContract(pool.etoken, IETokenAbi, ETH_CHAIN_ID);
    supplyRateCalls.push(
      marketsContract.read.interestRate([pool.underlying]).catch(_ => new BigNumber(0))
    );
    rewardRateCalls.push(rewardContract.read.rewardRate());
    totalSupplyCalls.push(rewardContract.read.totalSupply());
    exchangeRateCalls.push(
      etokenContract.read.convertBalanceToUnderlying([new BigNumber('1e18').toString()])
    );
  });

  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(rewardRateCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(exchangeRateCalls),
  ]);

  const supplyRates = res[0].map(v => new BigNumber(v.toString()));
  const rewardRates = res[1].map(v => new BigNumber(v.toString()));
  const totalSupplys = res[2].map(v => new BigNumber(v.toString()));
  const exchangeRates = res[3].map(v => new BigNumber(v.toString()));

  return { supplyRates, rewardRates, totalSupplys, exchangeRates };
};

module.exports = getEulerApys;
