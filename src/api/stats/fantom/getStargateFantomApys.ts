import { SPOOKY_LPF } from '../../../constants';

import { getMasterChefApys } from '../common/getMasterChefApys';
import { AbiItem } from 'web3-utils';
import { fantomWeb3 as web3, multicallAddress } from '../../../utils/web3';
import StargateChefAbi from '../../../abis/fantom/StargateChef.json';
import StargateERC20Abi from '../../../abis/fantom/StargateERC20.json';
// const pools = require('../../../data/fantom/0xdaoPools.json');
import { isSushiClient, isBeetClient, spookyClient } from '../../../apollo/client';
import {
  getTradingFeeApr,
  getTradingFeeAprBalancer,
  getTradingFeeAprSushi,
} from '../../../utils/getTradingFeeApr';
import getApyBreakdown from '../common/getApyBreakdown';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';
import { MasterChefApysParams } from '../common/getMasterChefApys';
import getBlockNumber from '../../../utils/getBlockNumber';
import { MultiCall } from 'eth-multicall';
import getBlockTime from '../../../utils/getBlockTime';

const getStargateFantomApys = async () => {
  const masterchefParams: MasterChefApysParams = {
    web3: web3,
    chainId: 250,
    masterchef: '0x224D8Fd7aB6AD4c6eb4611Ce56EF35Dec2277F03',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    pools: [],
    singlePools: [
      {
        name: 'stargate-ftm-usdc',
        poolId: 0,
        chainId: 250,
        address: '0x12edeA9cd262006cC3C4E77c90d2CD2DD4b1eb97',
        oracle: 'tokens',
        oracleId: 'USDC', // this is not right, should be S*USDC but where do we get S*USDC's price?
        decimals: '1e6',
      },
    ],
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
    allocPointIndex: '1',
    tradingFeeInfoClient: spookyClient,
    liquidityProviderFee: SPOOKY_LPF,
    // log: true,
  };
  masterchefParams.pools = [
    ...(masterchefParams.pools ?? []),
    ...(masterchefParams.singlePools ?? []),
  ];

  const tradingAprs = await getTradingAprs(masterchefParams);
  const farmApys = await getFarmApys(masterchefParams);

  const liquidityProviderFee = masterchefParams.liquidityProviderFee ?? 0.003;

  return getApyBreakdown(masterchefParams.pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getFarmApys = async params => {
  const apys: BigNumber[] = [];

  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const { blockRewards, totalAllocPoint } = await getMasterChefData(params);
  const { totalLiquidities, totalSupplies, allocPoints, lpBalances } = await getPoolsData(params);

  const secondsPerBlock = params.secondsPerBlock ?? (await getBlockTime(params.chainId));
  if (params.log) {
    console.log(
      params.tokenPerBlock,
      blockRewards.div(params.decimals).toNumber(),
      'secondsPerBlock',
      secondsPerBlock,
      totalAllocPoint.toNumber()
    );
  }

  for (let i = 0; i < params.pools.length; i++) {
    const apr = stargateUI_getFarmAPR(
      tokenPrice,
      blockRewards.shiftedBy(-18),
      allocPoints[i],
      totalAllocPoint,
      stargateUI_chainConstants.FANTOM,
      totalLiquidities[i].shiftedBy(-6),
      lpBalances[i].shiftedBy(-6),
      totalSupplies[i].shiftedBy(-6)
    );
    const apy = new BigNumber(stargateUI_getFarmAPY(apr));
    apys.push(apy);
  }

  return apys;
};

const getPoolsData = async (params: MasterChefApysParams) => {
  const abi = StargateChefAbi as AbiItem[];
  const lpAbi = StargateERC20Abi as AbiItem[];
  const masterchefContract = new params.web3.eth.Contract(abi, params.masterchef);
  const multicall = new MultiCall(params.web3 as any, multicallAddress(params.chainId));
  const balanceCalls = [];
  const allocPointCalls = [];
  const lpBalanceCalls = [];

  params.pools.forEach(pool => {
    const tokenContract = new params.web3.eth.Contract(lpAbi, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.strat ?? params.masterchef),
      totalLiquidity: tokenContract.methods.totalLiquidity(),
      totalSupply: tokenContract.methods.totalSupply(),
    });
    allocPointCalls.push({
      allocPoint: masterchefContract.methods.poolInfo(pool.poolId),
    });
    lpBalanceCalls.push({
      lpBalance: masterchefContract.methods.lpBalances(pool.poolId),
    });
  });

  const res = await multicall.all([balanceCalls, allocPointCalls, lpBalanceCalls]);

  const balances: BigNumber[] = res[0].map(v => new BigNumber(v.balance));
  const allocPoints: BigNumber[] = res[1].map(
    v => new BigNumber(v.allocPoint[params.allocPointIndex ?? '1'])
  );
  const lpBalances: BigNumber[] = res[2].map(v => new BigNumber(v.lpBalance));
  const totalLiquidities: BigNumber[] = res[0].map(v => new BigNumber(v.totalLiquidity));
  const totalSupplies: BigNumber[] = res[0].map(v => new BigNumber(v.totalSupply));
  return { balances, totalLiquidities, totalSupplies, allocPoints, lpBalances };
};

/**
 * Duplicated from getMasterChefApys
 */
const getTradingAprs = async params => {
  let tradingAprs = params.tradingAprs ?? {};
  const client = params.tradingFeeInfoClient;
  const fee = params.liquidityProviderFee;
  if (client && fee) {
    const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
    const getAprs = isSushiClient(client)
      ? getTradingFeeAprSushi
      : isBeetClient(client)
      ? getTradingFeeAprBalancer
      : getTradingFeeApr;
    const aprs = await getAprs(client, pairAddresses, fee);
    tradingAprs = { ...tradingAprs, ...aprs };
  }
  return tradingAprs;
};

const getMasterChefData = async (params: MasterChefApysParams) => {
  const abi = StargateChefAbi as AbiItem[];
  const masterchefContract = new params.web3.eth.Contract(abi, params.masterchef);
  let multiplier = new BigNumber(1);
  if (params.hasMultiplier) {
    const blockNum = await getBlockNumber(params.chainId);
    const period = params.useMultiplierTimestamp ? Math.floor(Date.now() / 1000) : blockNum;
    multiplier = new BigNumber(
      await masterchefContract.methods.getMultiplier(period - 1, period).call()
    );
  }
  const blockRewards = new BigNumber(
    await masterchefContract.methods[params.tokenPerBlock]().call()
  );
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { multiplier, blockRewards, totalAllocPoint };
};

/**
 * Following code is extracted from minified stargate UI code
 * I'm not sure what it does, but it returns the UI's APR
 */

const stargateUI_chainConstants = {
  ETHEREUM: 13.21448276,
  AVALANCHE: 2.028275862,
  BSC: 3.012068966,
  POLYGON: 2.447586207,
  ARBITRUM: 13.21448276,
  OPTIMISM: 3.065271967,
  FANTOM: 0.9755172414,
};

function stargateUI_getFarmAPR(
  stgPrice: BigNumber,
  stgPerBlock: BigNumber,
  allocPoint: BigNumber,
  totalAllocPoint: BigNumber,
  chainConstant: number,
  totalLiquidity: BigNumber,
  lpBalance: BigNumber,
  totalSupply: BigNumber
) {
  // ratio = new xn(1e4 * allocPoint, 1e4 * totalAllocPoint)
  let ratio = allocPoint.shiftedBy(4).dividedBy(totalAllocPoint.shiftedBy(4));
  var u = stgPerBlock.times(ratio);
  var l = totalLiquidity.times(lpBalance).dividedBy(totalSupply);
  var c = u.times(stgPrice).dividedBy(l);
  // d =  N.BigInt(Math.floor(31536e3 / chainConstant))
  var d = new BigNumber(Math.floor(31536e3 / chainConstant)).decimalPlaces(0);
  var f = c.times(d);
  return f.toNumber();
}

function stargateUI_getFarmAPY(apr: number) {
  return Math.pow(Math.E, apr) - 1;
}

module.exports = getStargateFantomApys;
