const BigNumber = require('bignumber.js');
const { cantoWeb3: web3 } = require('../../../utils/web3');

const fetchPrice = require('../../../utils/fetchPrice');
const Comptroller = require('../../../abis/canto/CantoLend.json');
const IToken = require('../../../abis/VToken.json');
const volatilePools = require('../../../data/canto/cantoLpPools.json');
const stablePools = require('../../../data/canto/cantoStableLpPools.json');
const getBlockTime = require('../../../utils/getBlockTime');
import getApyBreakdown from '../common/getApyBreakdown';
const { CANTO_CHAIN_ID: chainId } = require('../../../constants');
const { getContractWithProvider } = require('../../../utils/contractHelper');

const pools = [...volatilePools, ...stablePools];

const COMPTROLLER = '0x5E23dC409Fc2F832f83CEc191E245A191a4bCc5C';

const getCantoLpApys = async () => {
  let aprs = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  aprs = await Promise.all(promises);

  return await getApyBreakdown(pools, 0, aprs, 0);
};

const getPoolApy = async pool => {
  const secondsPerBlock = await Promise.all([getBlockTime(chainId)]);
  const BLOCKS_PER_YEAR = 31536000 / secondsPerBlock;

  return getSupplyApys(pool, BLOCKS_PER_YEAR);
};

const getSupplyApys = async (pool, BLOCKS_PER_YEAR) => {
  const ctokenContract = getContractWithProvider(IToken, pool.cToken, web3);
  const comptrollerContract = getContractWithProvider(Comptroller, COMPTROLLER, web3);

  let [rewardPrice, tokenPrice, compRate, totalSupply, exchangeRateStored] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'WCANTO' }),
    fetchPrice({ oracle: 'lps', id: pool.name }),
    comptrollerContract.methods.compSupplySpeeds(pool.cToken).call(),
    ctokenContract.methods.totalSupply().call(),
    ctokenContract.methods.exchangeRateStored().call(),
  ]);

  compRate = new BigNumber(compRate);
  totalSupply = new BigNumber(totalSupply);
  exchangeRateStored = new BigNumber(exchangeRateStored);

  //console.log(pool.name, compRate.toNumber(), totalSupply.toNumber(), exchangeRateStored.toNumber());

  const compPerYear = compRate.times(BLOCKS_PER_YEAR);
  const compPerYearInUsd = compPerYear.div('1e18').times(rewardPrice);

  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);
  const apr = compPerYearInUsd.dividedBy(totalSuppliedInUsd);

  return apr;
};

module.exports = getCantoLpApys;
