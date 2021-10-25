const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const ISmartVault = require('../../../abis/matic/TetuSmartVault.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/tetuLpPools');
import { POLYGON_CHAIN_ID } from '../../../constants';
import getApyBreakdown from '../common/getApyBreakdown';

const xTETUAddress = '0x225084D30cc297F3b177d9f93f5C3Ab8fb6a1454';
const afterBurnFee = 0.3;

const getTetuApys = async () => {
  const farmApys = await getFarmApys();
  const apyBreakdown = getApyBreakdown(pools, 0, farmApys, 0);

  return apyBreakdown;
};

const getFarmApys = async () => {
  const apys = [];
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'TETU' });
  const xTokenPrice = await getXPrice(tokenPrice);
  const { balances, rewardRates } = await getPoolsData();

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const oracle = 'lps';
    const id = pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals);

    const secondsPerYear = 31536000;
    const yearlyRewards = rewardRates[i].times(secondsPerYear).times(afterBurnFee);
    const yearlyRewardsInUsd = yearlyRewards.times(xTokenPrice).dividedBy('1e18');

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
  }
  return apys;
};

const getPoolsData = async () => {
  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));
  const balanceCalls = [];
  const rewardRateCalls = [];
  pools.forEach(pool => {
    const rewardPool = new web3.eth.Contract(ISmartVault, pool.rewardPool);
    balanceCalls.push({
      balance: rewardPool.methods.totalSupply(),
    });
    rewardRateCalls.push({
      rewardRate: rewardPool.methods.rewardRateForToken(xTETUAddress),
    });
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  return { balances, rewardRates };
};

const getXPrice = async tokenPrice => {
  const xTokenContract = new web3.eth.Contract(ISmartVault, xTETUAddress);
  const exchangeRate = new BigNumber(await xTokenContract.methods.getPricePerFullShare().call());

  return exchangeRate.times(tokenPrice).dividedBy('1e18');
};

module.exports = { getTetuApys };
