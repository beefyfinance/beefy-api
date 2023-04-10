import BigNumber from 'bignumber.js';
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import fetchPrice from '../../../utils/fetchPrice';
import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';
import { arbitrumWeb3 as web3 } from '../../../utils/web3';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
// import { arbidexClient } from '../../../apollo/client';

import { ERC20, ERC20_ABI } from '../../../abis/common/ERC20';
const abi = require('../../../abis/arbitrum/ArbidexMasterChef.json');
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
  const tradingAprs = await getTradingAprs();
  const farmApys = await getFarmApys();

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
      .times(arxAllocPoints[i])
      .dividedBy(arxTotalAllocPoint)
      .times(1 - (pool.depositFee ?? 0));

    const poolWethRewards = WETHPerSec.times(WETHAllocPoints[i])
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
  const masterchefContract = getContractWithProvider(abi, masterchef, web3);
  const multicall = new MultiCall(web3 as any, multicallAddress(chainId));
  const balanceCalls = [];
  const allocPointCalls = [];

  const chefCalls = [
    {
      arxPerSec: masterchefContract.methods.arxPerSec(),
      WETHPerSec: masterchefContract.methods.WETHPerSec(),
      arxTotalAllocPoint: masterchefContract.methods.arxTotalAllocPoint(),
      WETHTotalAllocPoint: masterchefContract.methods.WETHTotalAllocPoint(),
    },
  ];

  pools.forEach(pool => {
    const tokenContract = getContract(ERC20_ABI, pool.address) as unknown as ERC20;
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.strat ?? masterchef),
    });
    allocPointCalls.push({
      allocPoint: masterchefContract.methods.poolInfo(pool.poolId),
    });
  });

  const res = await multicall.all([balanceCalls, allocPointCalls, chefCalls]);

  return {
    poolsData: {
      balances: res[0].map(v => new BigNumber(v.balance)),
      arxAllocPoints: res[1].map(v => v.allocPoint['1']),
      WETHAllocPoints: res[1].map(v => v.allocPoint['2']),
    },
    chefData: res[2].map(v => ({
      arxPerSec: new BigNumber(v.arxPerSec),
      WETHPerSec: new BigNumber(v.WETHPerSec),
      arxTotalAllocPoint: new BigNumber(v.arxTotalAllocPoint),
      WETHTotalAllocPoint: new BigNumber(v.WETHTotalAllocPoint),
    }))[0],
  };
};

module.exports = getArbidexApys;
