const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../utils/fetchPrice');
const volatilePools = require('../../../data/canto/cantoLpPools.json');
const stablePools = require('../../../data/canto/cantoStableLpPools.json');
const getBlockTime = require('../../../utils/getBlockTime');
import VToken from '../../../abis/VToken';
import CantoLendAbi from '../../../abis/canto/CantoLend';
import { CANTO_CHAIN_ID } from '../../../constants';
import { fetchContract } from '../../rpc/client';
import { getApyBreakdown, ApyBreakdownResult } from '../common/getApyBreakdown';
const { CANTO_CHAIN_ID: chainId } = require('../../../constants');

const pools = [...volatilePools, ...stablePools];
const COMPTROLLER: string = '0x5E23dC409Fc2F832f83CEc191E245A191a4bCc5C';

interface PoolsData {
  compRates;
  totalSupplys;
  exchangeRates;
}

const getCantoLpApys = async (): Promise<ApyBreakdownResult> => {
  let { compRates, totalSupplys, exchangeRates }: PoolsData = await getPoolsData(pools);

  const aprPromises = pools.map((p, i) =>
    getPoolApy(p, compRates[i], totalSupplys[i], exchangeRates[i])
  );
  const aprs = await Promise.all(aprPromises);

  return await getApyBreakdown(pools, BigNumber(0), aprs, 0);
};

const getPoolsData = async (pools): Promise<PoolsData> => {
  const comptrollerCalls = [];
  const totalSupplyCalls = [];
  const exchangeRateStoredCalls = [];
  pools.forEach(pool => {
    const ctokenContract = fetchContract(pool.cToken, VToken, CANTO_CHAIN_ID);
    const comptrollerContract = fetchContract(COMPTROLLER, CantoLendAbi, CANTO_CHAIN_ID);
    comptrollerCalls.push(comptrollerContract.read.compSupplySpeeds([pool.cToken]));
    totalSupplyCalls.push(ctokenContract.read.totalSupply());
    exchangeRateStoredCalls.push(ctokenContract.read.exchangeRateStored());
  });

  const res = await Promise.all([
    Promise.all(comptrollerCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(exchangeRateStoredCalls),
  ]);

  const compRates = res[0].map(v => new BigNumber(v.toString()));
  const totalSupplys = res[1].map(v => new BigNumber(v.toString()));
  const exchangeRates = res[2].map(v => new BigNumber(v.toString()));

  return { compRates, totalSupplys, exchangeRates };
};

const getPoolApy = async (pool, compRate, totalSupply, exchangeRate) => {
  const secondsPerBlock = await getBlockTime(chainId);
  const BLOCKS_PER_YEAR = 31536000 / secondsPerBlock;

  let [rewardPrice, tokenPrice] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'WCANTO' }),
    fetchPrice({ oracle: 'lps', id: pool.name }),
  ]);

  const compPerYear = compRate.times(BLOCKS_PER_YEAR);
  const compPerYearInUsd = compPerYear.div('1e18').times(rewardPrice);

  const totalSupplied = totalSupply.times(exchangeRate).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);
  const apr = compPerYearInUsd.dividedBy(totalSuppliedInUsd);

  return apr;
};

module.exports = getCantoLpApys;
