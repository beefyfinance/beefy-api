const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { ethereumWeb3: web3, multicallAddress } = require('../../../utils/web3');

const IMultiRewarder = require('../../../abis/IMultiRewarder.json');
const stablePools = require('../../../data/ethereum/solidlyStableLpPools.json');
const volatilePools = require('../../../data/ethereum/solidlyLpPools.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { ETH_CHAIN_ID } = require('../../../constants');
import { getContractWithProvider, getContract } from '../../../utils/contractHelper';
import getApyBreakdown from '../common/getApyBreakdown';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  ethereum: {
    tokens: { SOLID },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const SECONDS_PER_YEAR = 31536000;
const Rewarder = '0x64A07ac478367245f4A84b96d5EcB8DF1691E425';

const getMonolithLpApys = async () => {
  let apys = [];

  apys = await getFarmApys(pools);

  return getApyBreakdown(pools, 0, apys, 0);
};

const getFarmApys = async pools => {
  const apys = [];
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: SOLID.symbol });
  const { balances, rewardRates, finishes } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    let yearlyRewardsInUsd = new BigNumber(0);
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    if (new BigNumber(finishes[i]).gte(Date.now() / 1000)) {
      const yearlyRewards = rewardRates[i].times(SECONDS_PER_YEAR);
      yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');
    }

    for (const rewards of pool.rewards ?? []) {
      const rewarder = getContractWithProvider(IMultiRewarder, Rewarder, web3);
      const data = await rewarder.methods.rewardData(pool.address, rewards.address).call();

      let additionalRewards = new BigNumber(0);

      if (new BigNumber(data.periodFinish).gte(Date.now() / 1000)) {
        const rate = new BigNumber(data.rewardRate);
        additionalRewards = rate
          .times(SECONDS_PER_YEAR)
          .times(await fetchPrice({ oracle: 'tokens', id: rewards.oracleId }))
          .dividedBy(rewards.decimals);
      }

      //console.log(pool.name, additionalRewards.toNumber());
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(additionalRewards);
    }

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    //console.log(pool.name, apy.toNumber(), yearlyRewardsInUsd.toNumber(), totalStakedInUsd.toNumber());
  }
  return apys;
};

const getPoolsData = async pools => {
  const multicall = new MultiCall(web3, multicallAddress(ETH_CHAIN_ID));
  const balanceCalls = [];
  const rewardRateCalls = [];
  pools.forEach(pool => {
    const rewarder = getContract(IMultiRewarder, Rewarder);
    balanceCalls.push({
      balance: rewarder.methods.totalSupply(pool.address),
    });
    rewardRateCalls.push({
      rewardRate: rewarder.methods.rewardData(pool.address, SOLID.address),
    });
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate[2]));
  const finishes = res[1].map(v => new BigNumber(v.rewardRate[1]));
  return { balances, rewardRates, finishes };
};

module.exports = getMonolithLpApys;
