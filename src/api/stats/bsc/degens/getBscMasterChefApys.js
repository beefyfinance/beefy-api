const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { bscWeb3: web3, multicallAddress } = require('../../../../utils/web3');

const MasterChefAbi = require('../../../../abis/MasterChef.json');
const ERC20 = require('../../../../abis/ERC20.json');
const { BASE_HPY, BSC_CHAIN_ID } = require('../../../../constants');
const fetchPrice = require('../../../../utils/fetchPrice');
const getBlockNumber = require('../../../../utils/getBlockNumber');
import { getContract, getContractWithProvider } from '../../../../utils/contractHelper';
import { getFarmWithTradingFeesApy } from '../../../../utils/getFarmWithTradingFeesApy';
import { getTotalPerformanceFeeForVault } from '../../../vaults/getVaultFees';
const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
const { compound } = require('../../../../utils/compound');

const getMasterChefApys = async masterchefParams => {
  let apys = {};
  let apyBreakdowns = {};

  masterchefParams.pools = [
    ...(masterchefParams.pools ?? []),
    ...(masterchefParams.singlePools ?? []),
  ];

  const tradingAprs = await getTradingAprs(masterchefParams);
  const farmApys = await getFarmApys(masterchefParams);

  masterchefParams.pools.forEach((pool, i, params) => {
    const hpy = pool.hpy ?? BASE_HPY;
    const perfFee = pool.perfFee ?? performanceFee;
    const performanceFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterPerfFee = 1 - performanceFee;

    const simpleApr = farmApys[i];
    const vaultApr = simpleApr.times(shareAfterPerfFee);
    const tradingApr = tradingAprs[pool.address.toLowerCase()] ?? new BigNumber(0);
    const vaultApy = compound(simpleApr, hpy, 1, shareAfterPerfFee);
    const totalApy = getFarmWithTradingFeesApy(simpleApr, tradingApr, hpy, 1, shareAfterPerfFee);

    // Create reference for legacy /apy
    const legacyApyValue = { [pool.name]: totalApy };
    apys = { ...apys, ...legacyApyValue };

    // Create reference for breakdown /apy
    const componentValues = {
      [pool.name]: {
        vaultApr: vaultApr.toNumber(),
        compoundingsPerYear: hpy,
        beefyPerformanceFee: perfFee,
        vaultApy: vaultApy,
        lpFee: params.liquidityProviderFee,
        tradingApr: tradingApr.toNumber(),
        totalApy: totalApy,
      },
    };
    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  });

  return {
    apys,
    apyBreakdowns,
  };
};

const getTradingAprs = async params => {
  let tradingAprs = [];
  const client = params.tradingFeeInfoClient;
  const fee = params.liquidityProviderFee;
  if (client && fee) {
    const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
    const getAprs = getTradingFeeApr;
    tradingAprs = await getAprs(client, pairAddresses, fee);
  }
  return tradingAprs;
};

const getFarmApys = async params => {
  const apys = [];

  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const { multiplier, blockRewards, totalAllocPoint } = await getMasterChefData(params);
  const { balances, allocPoints } = await getPoolsData(params);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const poolBlockRewards = blockRewards
      .times(multiplier)
      .times(allocPoints[i])
      .dividedBy(totalAllocPoint);

    const secondsPerBlock = params.secondsPerBlock ?? 3;
    const secondsPerYear = 31536000;
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(params.decimals);

    if (params.log) {
      console.log(pool.name, 'staked:', totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
    }

    apys.push(yearlyRewardsInUsd.dividedBy(totalStakedInUsd));
  }

  return apys;
};

const getMasterChefData = async params => {
  const abi = params.masterchefAbi ?? chefAbi(params.tokenPerBlock);
  const masterchefContract = getContractWithProvider(abi, params.masterchef, web3);
  let multiplier = new BigNumber(1);
  if (params.hasMultiplier) {
    const blockNum = await getBlockNumber(BSC_CHAIN_ID);
    multiplier = new BigNumber(
      await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
    );
  }
  const blockRewards = new BigNumber(
    await masterchefContract.methods[params.tokenPerBlock]().call()
  );
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { multiplier, blockRewards, totalAllocPoint };
};

const getPoolsData = async params => {
  const abi = params.masterchefAbi ?? chefAbi(params.tokenPerBlock);
  const masterchefContract = getContract(abi, params.masterchef);
  const multicall = new MultiCall(web3, multicallAddress(BSC_CHAIN_ID));
  const balanceCalls = [];
  const allocPointCalls = [];
  params.pools.forEach(pool => {
    const tokenContract = getContract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.strat ?? params.masterchef),
    });
    allocPointCalls.push({
      allocPoint: masterchefContract.methods.poolInfo(pool.poolId),
    });
  });

  const res = await multicall.all([balanceCalls, allocPointCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['1']);
  return { balances, allocPoints };
};

const chefAbi = tokenPerBlock => {
  const cakeAbi = MasterChefAbi;
  cakeAbi.push({
    inputs: [],
    name: tokenPerBlock,
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  });
  return cakeAbi;
};

module.exports = getMasterChefApys;
