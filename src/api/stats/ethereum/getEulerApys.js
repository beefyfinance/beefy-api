const BigNumber = require('bignumber.js');

const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const { MultiCall } = require('eth-multicall');
import { getContract } from '../../../utils/contractHelper';
const { ethereumWeb3: web3, multicallAddress } = require('../../../utils/web3');
import { ETH_HPY, ETH_CHAIN_ID as chainId } from '../../../constants';
const IMarkets = require('../../../abis/ethereum/IMarkets.json');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');
const IEToken = require('../../../abis/ethereum/IEToken.json');
const IRewardPool = require('../../../abis/IRewardPool.json');

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
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const supplyRateCalls = [];
  const rewardRateCalls = [];
  const totalSupplyCalls = [];
  const exchangeRateCalls = [];
  const marketsContract = getContract(IMarkets, markets);
  pools.forEach(pool => {
    const rewardContract = getContract(IRewardPool, pool.rewardPool);
    const etokenContract = getContract(IEToken, pool.etoken);
    supplyRateCalls.push({
      supplyRate: marketsContract.methods.interestRate(pool.underlying),
    });
    rewardRateCalls.push({
      rewardRate: rewardContract.methods.rewardRate(),
    });
    totalSupplyCalls.push({
      totalSupply: rewardContract.methods.totalSupply(),
    });
    exchangeRateCalls.push({
      exchangeRate: etokenContract.methods.convertBalanceToUnderlying(new BigNumber('1e18')),
    });
  });

  const res = await multicall.all([
    supplyRateCalls,
    rewardRateCalls,
    totalSupplyCalls,
    exchangeRateCalls,
  ]);

  const supplyRates = res[0].map(v => new BigNumber(v.supplyRate));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  const totalSupplys = res[2].map(v => new BigNumber(v.totalSupply));
  const exchangeRates = res[3].map(v => new BigNumber(v.exchangeRate));

  return { supplyRates, rewardRates, totalSupplys, exchangeRates };
};

module.exports = getEulerApys;
