import BigNumber from 'bignumber.js';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import fetchPrice from '../../../utils/fetchPrice';
import { ARBITRUM_CHAIN_ID } from '../../../constants';
// import { arbidexClient } from '../../../apollo/client';
import { fetchContract } from '../../rpc/client';
import ArbidexMasterChefAbi from '../../../abis/arbitrum/ArbidexMasterChef';
import ERC20Abi from '../../../abis/ERC20Abi';
const pools = require('../../../data/arbitrum/arbidexLpPools.json');

const log = false; // Debug Logging

const secondsPerYear = 31536000;

const masterchef = '0xd2bcFd6b84E778D2DE5Bb6A167EcBBef5D053A06';
const oracle = 'tokens';
const oracleId = 'ARX';
const decimals = '1e18';
const nativeId = 'ETH';
const nativeDecimals = '1e18';
const liquidityProviderFee = 0.0025;
const tradingFeeClient = null;

const getArbidexApys = async (): Promise<ApyBreakdownResult> => {
  const [tradingAprs, farmApys] = await Promise.all([getTradingAprs(), getFarmApys()]);
  return getApyBreakdown(pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getTradingAprs = async () => {
  let tradingAprs = {};

  if (tradingFeeClient && liquidityProviderFee) {
    const pairAddresses = pools.map(pool => pool.address.toLowerCase());
    tradingAprs = await getTradingFeeApr(tradingFeeClient, pairAddresses, liquidityProviderFee);
  }
  return tradingAprs;
};

const getFarmApys = async (): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const arxPrice = await fetchPrice({ oracle: oracle, id: oracleId });
  const wethPrice = await fetchPrice({ oracle: oracle, id: nativeId });
  const {
    chefData: { arxPerSec, WETHPerSec, arxTotalAllocPoint, WETHTotalAllocPoint },
    poolsData: { WETHAllocPoints, arxAllocPoints, balances },
  } = await getMulticallData();

  if (log) {
    console.log(
      'arxPerSec',
      arxPerSec.div(decimals).toNumber(),
      'WETHPerSec',
      WETHPerSec.div(nativeDecimals).toNumber(),
      'arxTotalAllocPoint',
      arxTotalAllocPoint.toNumber(),
      'WETHTotalAllocPoint',
      WETHTotalAllocPoint
    );
  }

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const poolArxRewards = arxPerSec
      .times(new BigNumber(arxAllocPoints[i].toString()))
      .dividedBy(arxTotalAllocPoint)
      .times(1 - (pool.depositFee ?? 0));

    const poolWethRewards = WETHPerSec.times(new BigNumber(WETHAllocPoints[i].toString()))
      .dividedBy(WETHTotalAllocPoint)
      .times(1 - (pool.depositFee ?? 0));

    const yearlyArxRewards = poolArxRewards.times(secondsPerYear);
    const yearlyWethRewards = poolWethRewards.times(secondsPerYear);

    const yearlyArxRewardsInUsd = yearlyArxRewards.times(arxPrice).dividedBy(decimals);
    const yearlyWethRewardsInUsd = yearlyWethRewards.times(wethPrice).dividedBy(nativeDecimals);

    const yearlyRewardsInUsd = yearlyArxRewardsInUsd.plus(yearlyWethRewardsInUsd);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    if (log) {
      console.log(
        pool.name,
        apy.toNumber(),
        totalStakedInUsd.valueOf(),
        yearlyRewardsInUsd.valueOf()
      );
    }
  }

  return apys;
};

const getMulticallData = async () => {
  const masterchefContract = fetchContract(masterchef, ArbidexMasterChefAbi, ARBITRUM_CHAIN_ID);

  const chefCalls = [
    masterchefContract.read.arxPerSec(),
    masterchefContract.read.WETHPerSec(),
    masterchefContract.read.arxTotalAllocPoint(),
    masterchefContract.read.WETHTotalAllocPoint(),
  ];
  const balanceCalls = (pools as any[]).map(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, ARBITRUM_CHAIN_ID);
    return tokenContract.read.balanceOf([pool.strat ?? masterchef]);
  });
  const allocPointCalls = (pools as any[]).map(pool => {
    return masterchefContract.read.poolInfo([pool.poolId]);
  });

  const [chefResults, balanceResults, allocResults] = await Promise.all([
    Promise.all(chefCalls),
    Promise.all(balanceCalls),
    Promise.all(allocPointCalls),
  ]);

  return {
    poolsData: {
      balances: balanceResults.map(v => new BigNumber(v.toString())),
      arxAllocPoints: allocResults.map(v => v['1']),
      WETHAllocPoints: allocResults.map(v => v['2']),
    },
    chefData: {
      arxPerSec: new BigNumber(chefResults[0].toString()),
      WETHPerSec: new BigNumber(chefResults[1].toString()),
      arxTotalAllocPoint: new BigNumber(chefResults[2].toString()),
      WETHTotalAllocPoint: new BigNumber(chefResults[3].toString()),
    },
  };
};

module.exports = getArbidexApys;
