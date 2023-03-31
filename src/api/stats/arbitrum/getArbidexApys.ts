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

  const { arxRewardsPerSec, WETHRewardsPerSec, arxTotalAllocPoint, WETHTotalAllocPoint } =
    await getMasterChefData();
  const { balances, arxAllocPoints, WETHAllocPoints } = await getPoolsData();

  if (log) {
    console.log(
      'arxPerSec',
      arxRewardsPerSec.div(decimals).toNumber(),
      'WETHPerSec',
      WETHRewardsPerSec.div(nativeDecimals).toNumber(),
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

    const poolArxRewards = arxRewardsPerSec
      .times(arxAllocPoints[i])
      .dividedBy(arxTotalAllocPoint)
      .times(1 - (pool.depositFee ?? 0));

    const poolWethRewards = WETHRewardsPerSec.times(WETHAllocPoints[i])
      .dividedBy(WETHTotalAllocPoint)
      .times(1 - (pool.depositFee ?? 0));

    const secondsPerYear = 31536000;
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

const getMasterChefData = async () => {
  const masterchefContract = getContractWithProvider(abi, masterchef, web3);

  const arxRewardsPerSec = new BigNumber(await masterchefContract.methods.arxPerSec().call());
  const WETHRewardsPerSec = new BigNumber(await masterchefContract.methods.WETHPerSec().call());
  const arxTotalAllocPoint = new BigNumber(
    await masterchefContract.methods.arxTotalAllocPoint().call()
  );
  const WETHTotalAllocPoint = new BigNumber(
    await masterchefContract.methods.WETHTotalAllocPoint().call()
  );
  return { arxRewardsPerSec, WETHRewardsPerSec, arxTotalAllocPoint, WETHTotalAllocPoint };
};

const getPoolsData = async () => {
  const masterchefContract = getContract(abi, masterchef);
  const multicall = new MultiCall(web3 as any, multicallAddress(chainId));
  const balanceCalls = [];
  const allocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = getContract(ERC20_ABI, pool.address) as unknown as ERC20;
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.strat ?? masterchef),
    });
    allocPointCalls.push({
      allocPoint: masterchefContract.methods.poolInfo(pool.poolId),
    });
  });

  const res = await multicall.all([balanceCalls, allocPointCalls]);

  const balances: BigNumber[] = res[0].map(v => new BigNumber(v.balance));
  const arxAllocPoints: BigNumber[] = res[1].map(v => v.allocPoint['1']);
  const WETHAllocPoints: BigNumber[] = res[1].map(v => v.allocPoint['2']);
  return { balances, arxAllocPoints, WETHAllocPoints };
};

module.exports = getArbidexApys;
