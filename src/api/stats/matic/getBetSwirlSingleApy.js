const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../utils/fetchPrice');
const { POLYGON_CHAIN_ID } = require('../../../constants');
import getApyBreakdown from '../common/getApyBreakdown';
import { addressBook } from '../../../../packages/address-book/address-book';
import BetSwirlSingleStaking from '../../../abis/BetSwirlSingleStaking';
import { fetchContract } from '../../rpc/client';
const {
  polygon: {
    tokens: { BETS, MATIC },
  },
} = addressBook;

const pools = [
  {
    name: 'betswirl-poly-bets',
    address: BETS.address,
    rewardPool: '0xa184468972c71209BC31a5eF39b7321d2A839225',
    oracle: 'tokens',
    oracleId: 'BETS',
    decimals: '1e18',
  },
];

const getBetSwirlSingleApy = async () => {
  let apys = [];

  apys = await getFarmApys(pools);

  return getApyBreakdown(pools, 0, apys, 0);
};

const getFarmApys = async pools => {
  const apys = [];
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'MATIC' });
  const { balances, rewardRates, finishes } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    let yearlyRewardsInUsd = new BigNumber(0);
    const pool = pools[i];

    const stakedPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals);

    if (new BigNumber(finishes[i]).gte(Date.now() / 1000)) {
      const secondsPerYear = 31536000;
      const yearlyRewards = rewardRates[i].times(secondsPerYear);
      yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');
    }

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    //console.log(pool.name, apy.toNumber(), yearlyRewardsInUsd.toNumber(), totalStakedInUsd.toNumber());
  }
  return apys;
};

const getPoolsData = async pools => {
  const balanceCalls = [];
  const rewardRateCalls = [];
  pools.forEach(pool => {
    const rewarder = fetchContract(pool.rewardPool, BetSwirlSingleStaking, POLYGON_CHAIN_ID);
    balanceCalls.push(rewarder.read.totalSupply());
    rewardRateCalls.push(rewarder.read.rewardData([MATIC.address]));
  });

  const res = await Promise.all([Promise.all(balanceCalls), Promise.all(rewardRateCalls)]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewardRates = res[1].map(v => new BigNumber(v[3].toString()));
  const finishes = res[1].map(v => new BigNumber(v[2].toString()));
  return { balances, rewardRates, finishes };
};

module.exports = getBetSwirlSingleApy;
