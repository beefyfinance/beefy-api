const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const ISingleStaking = require('../../../abis/BetSwirlSingleStaking.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
import { getContract } from '../../../utils/contractHelper';
import getApyBreakdown from '../common/getApyBreakdown';
import { addressBook } from '../../../../packages/address-book/address-book';
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
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const balanceCalls = [];
  const rewardRateCalls = [];
  pools.forEach(pool => {
    const rewarder = getContract(ISingleStaking, pool.rewardPool);
    balanceCalls.push({
      balance: rewarder.methods.totalSupply(),
    });
    rewardRateCalls.push({
      rewardRate: rewarder.methods.rewardData(MATIC.address),
    });
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate[3]));
  const finishes = res[1].map(v => new BigNumber(v.rewardRate[2]));
  return { balances, rewardRates, finishes };
};

module.exports = getBetSwirlSingleApy;
