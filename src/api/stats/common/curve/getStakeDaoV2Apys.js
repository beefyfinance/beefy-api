import BigNumber from 'bignumber.js';
import ICurveGauge from '../../../../abis/ICurveGauge';
import { fetchPrice } from '../../../../utils/fetchPrice';
import { fetchContract } from '../../../rpc/client';
import { parseAbi } from 'viem';
import { ARBITRUM_CHAIN_ID, BASE_CHAIN_ID, FRAXTAL_CHAIN_ID, SONIC_CHAIN_ID } from '../../../../constants';

const secondsPerYear = 31536000;
const abi = parseAbi([
  'function getTotalFeePercent() view returns (uint128)',
  'function fees() view returns (uint)',
  'function balanceOf() view returns (uint)',
]);
const convex = {
  convexVoterProxy: '0x989AEb4d175e16225E39E87d0D97A3360524AD80',
  convexBooster: '0xF403C135812408BFbE8713b5A23a04b3D48AAE31',
};
const addresses = {
  [BASE_CHAIN_ID]: {
    ...convex,
    accountant: '0x8f872cE018898ae7f218E5a3cE6Fe267206697F8',
    locker: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
  },
  [ARBITRUM_CHAIN_ID]: {
    ...convex,
    accountant: '0x93b4B9bd266fFA8AF68e39EDFa8cFe2A62011Ce0',
    locker: '0xe5d6D047DF95c6627326465cB27B64A8b77A8b91',
  },
  [FRAXTAL_CHAIN_ID]: {
    ...convex,
    accountant: '0x93b4B9bd266fFA8AF68e39EDFa8cFe2A62011Ce0',
    locker: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
    convexBooster: '0xd3327cb05a8E0095A543D582b5B3Ce3e19270389',
  },
  [SONIC_CHAIN_ID]: {
    ...convex,
    accountant: '0x8f872cE018898ae7f218E5a3cE6Fe267206697F8',
    locker: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
  },
};

export async function getStakeDaoV2Apys(chainId, pools) {
  const apys = [];
  const addr = addresses[chainId];
  if (!addr) throw new Error(`StakeDaoV2: no config for chain ${chainId}`);

  const hasConvex = pools.some(p => p.sdSideCar);
  const weekEpoch = Math.floor(Date.now() / 1000 / (86400 * 7));

  const extraData = [],
    extraCalls = [];
  const gauges = pools.map(pool => {
    const gauge = fetchContract(pool.gauge, ICurveGauge, chainId);
    pool.rewards?.forEach(extra => {
      extraCalls.push(gauge.read.reward_data([extra.token]));
      extraData.push({ pool: pool.name, token: extra.token });
    });
    return gauge;
  });

  const stakeDaoFeeCall = fetchContract(addr.accountant, abi, chainId).read.getTotalFeePercent();
  const convexFeeCall = hasConvex ? fetchContract(addr.convexBooster, abi, chainId).read.fees() : 0;
  const sideCarBalancesCalls = pools.map(p =>
    p.sdSideCar ? fetchContract(p.sdSideCar, abi, chainId).read.balanceOf() : 0
  );

  const [
    gaugeRewardRates,
    gaugeTotalSupplies,
    gaugeWorkingSupplies,
    stakeDaoBalances,
    stakeDaoWorkingBalances,
    convexBalances,
    convexWorkingBalances,
    sideCarBalances,
    stakeDaoFee,
    convexFee,
    extraResults,
  ] = await Promise.all([
    Promise.all(gauges.map(g => g.read.inflation_rate([weekEpoch]))),
    Promise.all(gauges.map(g => g.read.totalSupply())),
    Promise.all(gauges.map(g => g.read.working_supply())),
    Promise.all(gauges.map(g => g.read.balanceOf([addr.locker]))),
    Promise.all(gauges.map(g => g.read.working_balances([addr.locker]))),
    Promise.all(gauges.map(g => g.read.balanceOf([addr.convexVoterProxy]))),
    Promise.all(gauges.map(g => g.read.working_balances([addr.convexVoterProxy]))),
    Promise.all(sideCarBalancesCalls),
    stakeDaoFeeCall,
    convexFeeCall,
    Promise.all(extraCalls),
  ]);

  const crvPrice = await fetchPrice({ oracle: 'tokens', id: 'CRV' });
  const sdAfterFees = new BigNumber('1e18').minus(new BigNumber(stakeDaoFee)).div('1e18');
  const convexAfterFees = new BigNumber(10000).minus(convexFee).div(new BigNumber(10000));

  const extras = extraResults.map((_, i) => ({
    ...extraData[i],
    periodFinish: Number(extraResults[i][1]),
    rewardRate: new BigNumber(extraResults[i][2]),
  }));

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lockerBal = new BigNumber(stakeDaoBalances[i]);
    const lockerWorkingBal = new BigNumber(stakeDaoWorkingBalances[i]);
    const sdBoost = lockerWorkingBal > 0 ? lockerWorkingBal.div(lockerBal) : new BigNumber(1);
    const convexBal = new BigNumber(convexBalances[i]);
    const convexWorkingBal = new BigNumber(convexWorkingBalances[i]);
    const convexBoost = convexWorkingBal > 0 ? convexWorkingBal.div(convexBal) : new BigNumber(1);
    // console.log(pool.name, 'sdBoost', sdBoost.toNumber(), 'convexBoost', convexBoost.toNumber());

    let boost = sdAfterFees; // max boost minus fees if empty pool
    const sideCarBal = new BigNumber(sideCarBalances[i]);
    if (lockerBal > 0 || sideCarBal > 0) {
      const totalBal = lockerBal.plus(sideCarBal);
      const sdShare = lockerBal.div(totalBal).times(sdAfterFees);
      const convexShare = sideCarBal.div(totalBal).times(convexAfterFees);
      boost = sdBoost.times(sdShare).plus(convexBoost.times(convexShare));
    }

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const workingSupplyInUsd = new BigNumber(gaugeWorkingSupplies[i]).times(lpPrice);
    const maxCrvRewards = new BigNumber(gaugeRewardRates[i]).times(secondsPerYear).times(crvPrice);
    let apy = maxCrvRewards.times(boost).div(workingSupplyInUsd);
    // console.log(pool.name, 'boost', boost.toNumber(), 'crvApy', apy.toNumber());

    for (const extra of extras.filter(e => e.pool === pool.name)) {
      if (extra.periodFinish < Date.now() / 1000) continue;
      const poolExtra = pool.rewards.find(e => e.token === extra.token);
      const price = await fetchPrice({ oracle: poolExtra.oracle ?? 'tokens', id: poolExtra.oracleId });
      const extraRewardsInUsd = extra.rewardRate.times(secondsPerYear).times(price);
      const extraApy = extraRewardsInUsd.div(new BigNumber(gaugeTotalSupplies[i]).times(lpPrice));
      apy = apy.plus(extraApy);
      // console.log(pool.name, poolExtra.oracleId, extraApy.toNumber());
    }
    apys.push(apy);
  }
  return apys;
}
