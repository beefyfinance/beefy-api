const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { multicallAddress } = require('../../../utils/web3');
import { getContractWithProvider } from '../../../utils/contractHelper';

const IGauge = require('../../../abis/ISolidlyGauge.json');
const IVe = require('../../../abis/IVe.json');
const fetchPrice = require('../../../utils/fetchPrice');
import { getApyBreakdownWithFee } from '../common/getApyBreakdown';
import { getContract } from '../../../utils/contractHelper';

export const getSolidlyGaugeApys = async params => {
  const apysAndFees = await getFarmApys(params);

  return getApyBreakdownWithFee(params.pools, 0, apysAndFees.farmApys, 0, apysAndFees.beefyFees);
};

const getFarmApys = async params => {
  const apys = [];
  const fees = [];
  const rewardTokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const { balances, rewardRates, depositBalances } = await getPoolsData(params);
  let supply = 0;
  let veBalance = 0;
  if (params.boosted) {
    const ve = getContractWithProvider(IVe, params.ve, params.web3);
    supply = new BigNumber(await ve.methods.totalSupply().call());
    veBalance = new BigNumber(await ve.methods.balanceOfNFT(params.NFTid).call());
  }

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });

    let boost = 1;
    if (params.boosted) {
      const derived = depositBalances[i].times(40).dividedBy(100);
      const adjusted = balances[i].times(veBalance).dividedBy(supply).times(60).dividedBy(100);
      boost =
        depositBalances[i] >= adjusted.plus(derived)
          ? 1
          : adjusted.plus(derived).dividedBy(derived);
    }

    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    let yearlyRewards = 0;
    if (params.boosted) {
      yearlyRewards = rewardRates[i].times(secondsPerYear).times(0.4).times(boost).div('1e18');
    } else {
      yearlyRewards = rewardRates[i].times(secondsPerYear);
    }
    const yearlyRewardsInUsd = yearlyRewards.times(rewardTokenPrice).dividedBy(params.decimals);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    pool.beefyFee ? fees.push(pool.beefyFee) : fees.push(0.045);

    if (params.log) {
      console.log(
        pool.name,
        apy.toNumber(),
        totalStakedInUsd.valueOf(),
        yearlyRewardsInUsd.valueOf()
      );
    }
  }
  return {
    farmApys: apys,
    beefyFees: fees,
  };
};

const getPoolsData = async params => {
  const web3 = params.web3;
  const multicall = new MultiCall(web3, multicallAddress(params.chainId));
  const balanceCalls = [];
  const rewardRateCalls = [];
  const depositBalanceCalls = [];
  params.pools.forEach(pool => {
    const rewardPool = getContract(IGauge, pool.gauge);
    balanceCalls.push({
      balance: rewardPool.methods.totalSupply(),
    });
    rewardRateCalls.push({
      rewardRate: rewardPool.methods.rewardRate(params.reward),
    });
    if (params.boosted) {
      depositBalanceCalls.push({
        depositBalance: rewardPool.methods.balanceOf(params.gaugeStaker),
      });
    }
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls, depositBalanceCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  const depositBalances = res[0].map(v => new BigNumber(v.depositBalance));
  return { balances, rewardRates, depositBalances };
};

module.exports = { getSolidlyGaugeApys };
