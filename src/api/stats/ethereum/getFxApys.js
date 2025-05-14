import { ETH_CHAIN_ID } from '../../../constants';
import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveSubgraphApys } from '../common/curve/getCurveApyData';
import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../utils/fetchPrice';
import { fetchContract } from '../../rpc/client';
import ICurveGaugeController from '../../../abis/ethereum/ICurveGaugeController';
import IFees from '../../../abis/ConvexFeeRegistry.json';
import ICrv from '../../../abis/ethereum/ICrv';
import IFxGauge from '../../../abis/IFxGauge';
import ERC20Abi from '../../../abis/ERC20Abi';

const fxn = '0x365AccFCa291e7D3914637ABf1F7635dB165Bb09';
const veFxn = '0xEC6B8A3F3605B083F7044C0F31f2cac0caf1d469';
const gaugeController = '0xe60eB8098B34eD775ac44B1ddE864e098C6d7f37';
const cvxVoterProxy = '0xd11a4Ee017cA0BECA8FA45fF2abFe9C6267b7881';
const cvxFees = '0x4f258feCc91b2ff162cA702c2Bd9ABf2AF089611';
const secondsPerYear = 31536000;
const tradingFees = 0.0002;
const subgraphUrl = 'https://api.curve.finance/api/getSubgraphData/ethereum';
const pools = require('../../../data/ethereum/fxPools.json');

const defaultRewards = [
  {
    token: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    oracleId: 'CRV',
  },
  {
    token: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
    oracleId: 'CVX',
  },
];
pools.forEach(p => (p.rewards = p.rewards = [...defaultRewards, ...(p.rewards || [])]));

export const getFxApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveSubgraphApys(pools, subgraphUrl),
    getPoolApys(pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const getPoolApys = async pools => {
  const apys = [];

  const totalSupplyCalls = [];
  const workingCalls = [];
  const sharedBalCalls = [];
  const extraInfo = [];
  const extraRewardDataCalls = [];
  const weightCalls = [];
  pools.forEach(pool => {
    const gauge = fetchContract(pool.gauge, IFxGauge, ETH_CHAIN_ID);
    totalSupplyCalls.push(gauge.read.totalSupply());
    workingCalls.push(gauge.read.workingSupply());
    sharedBalCalls.push(gauge.read.sharedBalanceOf([cvxVoterProxy]));
    pool.rewards.forEach(reward => {
      extraInfo.push({ pool: pool.name, token: reward.token });
      extraRewardDataCalls.push(gauge.read.rewardData([reward.token]));
    });
    const controller = fetchContract(gaugeController, ICurveGaugeController, ETH_CHAIN_ID);
    weightCalls.push(controller.read.gauge_relative_weight([pool.gauge]));
  });
  const inflationRateCall = fetchContract(fxn, ICrv, ETH_CHAIN_ID)
    .read.rate()
    .then(v => new BigNumber(v.toString()));
  const res = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(workingCalls),
    Promise.all(extraRewardDataCalls),
    Promise.all(weightCalls),
    inflationRateCall,
    Promise.all(sharedBalCalls),
    fetchContract(veFxn, ERC20Abi, ETH_CHAIN_ID).read.balanceOf([cvxVoterProxy]),
    fetchContract(veFxn, ERC20Abi, ETH_CHAIN_ID).read.totalSupply(),
    fetchContract(cvxFees, IFees, ETH_CHAIN_ID).read.totalFees(),
  ]);
  const poolInfo = res[0].map((_, i) => ({
    rewardRate: new BigNumber(res[4].toString()).times(new BigNumber(res[3][i].toString())).div('1e18'),
    totalSupply: new BigNumber(res[0][i].toString()),
    workingSupply: new BigNumber(res[1][i].toString()),
    cvxSharedBal: new BigNumber(res[5][i].toString()),
  }));
  const extras = extraInfo.map((_, i) => ({
    ...extraInfo[i],
    periodFinish: new BigNumber(res[2][i][3].toString()),
    rewardRate: new BigNumber(res[2][i][1]),
  }));

  const cvxVeBal = new BigNumber(res[6].toString());
  const veSupply = new BigNumber(res[7].toString());
  const afterFees = new BigNumber(10000).minus(new BigNumber(res[8].toString())).div(10000);

  const fxnPrice = await fetchPrice({ oracle: 'tokens', id: 'FXN' });
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const info = poolInfo[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = info.totalSupply.times(lpPrice);

    let boost = new BigNumber(2.5);
    // min (Individual TVL x 0.4 + (Total TVL x Individual veFXN for the epoch) x 0.6 / Total veFXN for the epoch, Individual TVL) / (Individual TVL x 0.4)
    if (info.cvxSharedBal > 0) {
      boost = BigNumber.min(
        info.cvxSharedBal.times(0.4).plus(info.totalSupply.times(cvxVeBal).times(0.6).div(veSupply)),
        info.cvxSharedBal
      ).div(info.cvxSharedBal.times(0.4));
    }

    // boosted CRV rewards calculated based on working_supply, not totalSupply
    // but additional rewards calculated from totalSupply
    // we use totalSupply in totalStakedInUsd and increase rewards here by (* totalSupply / workingSupply)
    // so total APY can be calculated as rewardsInUsd / totalStaked
    let rewardsInUsd = info.rewardRate
      .times(secondsPerYear)
      .times(0.4)
      .times(boost)
      .times(fxnPrice)
      .times(info.totalSupply)
      .div(info.workingSupply)
      .times(afterFees);

    for (const extra of extras.filter(e => e.pool === pool.name)) {
      if (extra.periodFinish < Date.now() / 1000) continue;
      const poolExtra = pool.rewards.find(e => e.token === extra.token);
      const price = await fetchPrice({
        oracle: poolExtra.oracle ?? 'tokens',
        id: poolExtra.oracleId,
      });
      const extraRewardsInUsd = extra.rewardRate
        .times(secondsPerYear)
        .times(price)
        .times('1e18')
        .div(poolExtra.decimals || '1e18');
      rewardsInUsd = rewardsInUsd.plus(extraRewardsInUsd);

      // console.log(pool.name, poolExtra.oracleId, extraRewardsInUsd.div(totalStakedInUsd).valueOf());
    }
    const apy = rewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);

    // console.log(pool.name, apy.valueOf());
  }

  return apys;
};
