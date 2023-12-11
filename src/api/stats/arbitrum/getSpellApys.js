import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { getCurveFactoryApy } from '../common/curve/getCurveApyData';
import { fetchContract } from '../../rpc/client';
import MultiFeeDistribution from '../../../abis/common/MultiFeeDistribution/MultiFeeDistribution';
import BigNumber from 'bignumber.js';
import getApyBreakdown from '../common/getApyBreakdown';
import { fetchPrice } from '../../../utils/fetchPrice';

const pool = {
  name: 'spell-mim-crv',
  address: '0x30df229cefa463e991e29d42db0bae2e122b2ac7',
  gauge: '0x6d2070b13929Df15B13D96cFC509C574168988Cd',
  rewards: [
    { token: '0x3E6648C5a70A150A88bCE65F4aD4d506Fe15d2AF', oracleId: 'SPELL' },
    { token: '0x912CE59144191C1204E64559FE8253a0e49E6548', oracleId: 'ARB' },
  ],
  oracle: 'lps',
  oracleId: 'curve-arb-mim',
  decimals: '1e18',
};

const secondsPerYear = 31536000;

const getSpellApys = async () => {
  const tradingAprs = await getCurveFactoryApy(
    pool.address,
    'https://api.curve.fi/api/getFactoryAPYs-arbitrum'
  );

  const Gauge = fetchContract(pool.gauge, MultiFeeDistribution, chainId);
  const totalSupplyCall = Gauge.read.totalSupply();
  const rewardDataCalls = [];
  pool.rewards?.forEach(reward => {
    rewardDataCalls.push(Gauge.read.rewardData([reward.token]));
  });
  const [totalSupplyRes, rewardData] = await Promise.all([
    totalSupplyCall,
    Promise.all(rewardDataCalls),
  ]);
  const rewards = rewardData.map(r => ({
    periodFinish: r['1'],
    rewardRate: new BigNumber(r['2'].toString()),
    totalSupply: new BigNumber(totalSupplyRes.toString()),
  }));

  const lpPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  const totalStakedInUsd = rewards[0].totalSupply.times(lpPrice).div('1e18');

  let yearlyRewardsInUsd = new BigNumber(0);
  for (let i = 0; i < rewards.length; i++) {
    const info = rewards[i];
    if (info.periodFinish > Date.now() / 1000) {
      const poolReward = pool.rewards[i];
      const price = await fetchPrice({
        oracle: poolReward.oracle || 'tokens',
        id: poolReward.oracleId,
      });
      const rewardsInUsd = info.rewardRate.times(secondsPerYear).times(price).div('1e18');
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(rewardsInUsd);
      // console.log(pool.name, poolReward.oracleId, rewardsInUsd.valueOf());
    }
  }
  const apy = yearlyRewardsInUsd.div(totalStakedInUsd);
  return getApyBreakdown([pool], tradingAprs, [apy], 0.0002);
};

module.exports = { getSpellApys };
