const BigNumber = require('bignumber.js');
const { cantoWeb3: web3, multicallAddress } = require('../../../utils/web3');
const { MultiCall } = require('eth-multicall');
const fetchPrice = require('../../../utils/fetchPrice');
const Comptroller = require('../../../abis/canto/CantoLend.json');
const IToken = require('../../../abis/VToken.json');
const volatilePools = require('../../../data/canto/cantoLpPools.json');
const stablePools = require('../../../data/canto/cantoStableLpPools.json');
const getBlockTime = require('../../../utils/getBlockTime');
import { getApyBreakdown, ApyBreakdownResult } from '../common/getApyBreakdown';
const { CANTO_CHAIN_ID: chainId } = require('../../../constants');
const { getContract } = require('../../../utils/contractHelper');

const pools = [...volatilePools, ...stablePools];
const COMPTROLLER: string = '0x5E23dC409Fc2F832f83CEc191E245A191a4bCc5C';

interface PoolsData {
  compRates;
  totalSupplys;
  exchangeRates;
}

const getCantoLpApys = async (): Promise<ApyBreakdownResult> => {
  let aprs = [];
  let { compRates, totalSupplys, exchangeRates }: PoolsData = await getPoolsData(pools);

  for (let i = 0; i < pools.length; i++) {
    let apr = await getPoolApy(pools[i], compRates[i], totalSupplys[i], exchangeRates[i]);
    aprs.push(apr);
  }

  return await getApyBreakdown(pools, BigNumber(0), aprs, 0);
};

const getPoolsData = async (pools): Promise<PoolsData> => {
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  let comptrollerCalls = [];
  let cTokenCalls = [];
  pools.forEach(pool => {
    const ctokenContract = getContract(IToken, pool.cToken);
    const comptrollerContract = getContract(Comptroller, COMPTROLLER);
    comptrollerCalls.push({
      compRate: comptrollerContract.methods.compSupplySpeeds(pool.cToken),
    });

    cTokenCalls.push({
      totalSupply: ctokenContract.methods.totalSupply(),
      exchangeRateStored: ctokenContract.methods.exchangeRateStored(),
    });
  });

  const res = await multicall.all([comptrollerCalls, cTokenCalls]);

  const compRates = res[0].map(v => new BigNumber(v.compRate));
  const totalSupplys = res[1].map(v => new BigNumber(v.totalSupply));
  const exchangeRates = res[1].map(v => new BigNumber(v.exchangeRateStored));

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
