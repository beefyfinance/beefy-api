import { AbiItem } from 'web3-utils';
import { multicallAddress } from '../../../../utils/web3';
import StargateChefAbi from '../../../../abis/fantom/StargateChef.json';
import StargateERC20Abi from '../../../../abis/fantom/StargateERC20.json';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../../utils/fetchPrice';
import { MasterChefApysParams } from '../../common/getMasterChefApys';
import getBlockNumber from '../../../../utils/getBlockNumber';
import { MultiCall } from 'eth-multicall';
import getBlockTime from '../../../../utils/getBlockTime';
import { ChainId } from '../../../../../packages/address-book/address-book';

export const getStargateFarmApys = async params => {
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

  const chainConstant = stargateUI_chainConstants[params.chainId];
  for (let i = 0; i < params.pools.length; i++) {
    const apr = stargateUI_getFarmAPR(
      tokenPrice,
      blockRewards.shiftedBy(-18),
      allocPoints[i],
      totalAllocPoint,
      chainConstant,
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
 * Stargate uses these constants in their apr calculation.
 */

const stargateUI_chainConstants = {
  ETHEREUM: 13.21448276,
  [ChainId.avax]: 2.028275862,
  [ChainId.bsc]: 3.012068966,
  [ChainId.polygon]: 2.447586207,
  [ChainId.arbitrum]: 13.21448276,
  OPTIMISM: 3.065271967,
  [ChainId.fantom]: 0.9755172414,
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
  let ratio = allocPoint.shiftedBy(4).dividedBy(totalAllocPoint.shiftedBy(4));
  var u = stgPerBlock.times(ratio);
  var l = totalLiquidity.times(lpBalance).dividedBy(totalSupply);
  var c = u.times(stgPrice).dividedBy(l);
  var d = new BigNumber(Math.floor(31536e3 / chainConstant)).decimalPlaces(0);
  var f = c.times(d);
  return f.toNumber();
}

function stargateUI_getFarmAPY(apr: number) {
  return Math.pow(Math.E, apr) - 1;
}
