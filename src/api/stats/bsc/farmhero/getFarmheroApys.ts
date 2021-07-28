import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { bscWeb3 as web3, multicallAddress } from '../../../../utils/web3';

// abis
import { FarmHeroChef, FarmHeroChef_ABI } from '../../../../abis/matic/FarmHero/FarmHeroChef';
import {
  IFarmHeroStrategy,
  IFarmHeroStrategy_ABI,
} from '../../../../abis/matic/FarmHero/IFarmHeroStrategy';
// json data
import _pools from '../../../../data/farmheroPools.json';
const pools = _pools as LpPool[];

import fetchPrice from '../../../../utils/fetchPrice';
import { BSC_CHAIN_ID, PCS_LPF } from '../../../../constants';
import { getTradingFeeApr } from '../../../../utils/getTradingFeeApr';
import { cakeClient } from '../../../../apollo/client';
import getApyBreakdown from '../../common/getApyBreakdown';
import { addressBook } from '../../../../../packages/address-book/address-book/';
import { getEDecimals } from '../../../../utils/getEDecimals';
import { LpPool } from '../../../../types/LpPool';

const {
  platforms: { farmhero },
  tokens: { HONOR },
} = addressBook.polygon;

const chef = farmhero.chef;
const oracleId = HONOR.symbol;
const oracle = 'tokens';
const DECIMALS = getEDecimals(HONOR.decimals);
const secondsPerBlock = 1;
const secondsPerYear = 31536000;

export const getFarmheroApys = async () => {
  const pairAddresses = pools.filter(pool => pool.platform === 'pancake').map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(cakeClient, pairAddresses, PCS_LPF);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, PCS_LPF);
};

const getFarmApys = async (pools: LpPool[]): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];
  const chefContract = new web3.eth.Contract(FarmHeroChef_ABI, chef) as unknown as FarmHeroChef;
  const totalEpoch = await chefContract.methods.totalEpoch().call();
  const epochsLeft = await chefContract.methods.epochsLeft().call();
  const currentEpoch = (parseInt(totalEpoch) - parseInt(epochsLeft)).toString();
  const rewardPerSecond = new BigNumber(
    await chefContract.methods.epochReward(currentEpoch).call()
  );
  const erc20PoolRate = new BigNumber(await chefContract.methods.erc20PoolRate().call());
  const totalAllocPoint = new BigNumber(await chefContract.methods.totalAllocPoint(0).call()); //  enum PoolType { ERC20, ERC721, ERC1155 } // thus ERC20 = 0

  const tokenPrice: number = await fetchPrice({ oracle, id: oracleId });
  const { balances, allocPoints } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy(pool.decimals);
    const erc20PoolRewardPerSecond = rewardPerSecond.times(erc20PoolRate).dividedBy(1000);
    const poolBlockRewards = erc20PoolRewardPerSecond
      .times(allocPoints[i])
      .dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);
    const yearlyRewardsInUsdAfterPenalty = yearlyRewardsInUsd.div(2); // early withdraw penalty from vesting contract

    const apy = yearlyRewardsInUsdAfterPenalty.dividedBy(totalStakedInUsd);
    apys.push(apy);
  }
  return apys;
};

const getPoolsData = async (
  pools: LpPool[]
): Promise<{ balances: BigNumber[]; allocPoints: BigNumber[] }> => {
  const chefContract = new web3.eth.Contract(FarmHeroChef_ABI, chef) as unknown as FarmHeroChef;
  const multicall = new MultiCall(web3 as any, multicallAddress(BSC_CHAIN_ID));
  const balanceCalls = [];
  const allocPointCalls = [];
  pools.forEach(pool => {
    const stratContract = new web3.eth.Contract(
      IFarmHeroStrategy_ABI,
      pool.strat
    ) as unknown as IFarmHeroStrategy;
    balanceCalls.push({
      balance: stratContract.methods.wantLockedTotal(),
    });
    allocPointCalls.push({
      allocPoint: chefContract.methods.poolInfo(pool.poolId.toString()),
    });
  });

  const res = await multicall.all([balanceCalls, allocPointCalls]);

  const balances: BigNumber[] = res[0].map(v => new BigNumber(v.balance));
  const allocPoints: BigNumber[] = res[1].map(v => v.allocPoint['2']);
  return { balances, allocPoints };
};
