import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { polygonWeb3 as web3, multicallAddress } from '../../../utils/web3';

// abis
import { FarmHeroChef, FarmHeroChef_ABI } from '../../../abis/matic/FarmHero/FarmHeroChef';
import {
  IFarmHeroStrategy,
  IFarmHeroStrategy_ABI,
} from '../../../abis/matic/FarmHero/IFarmHeroStrategy';
import { ERC20, ERC20_ABI } from '../../../abis/common/ERC20';
// json data
import _pools from '../../../data/matic/farmheroPools.json';
const pools = _pools as LpPool[];

import fetchPrice from '../../../utils/fetchPrice';
import { POLYGON_CHAIN_ID, QUICK_LPF } from '../../../constants';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { quickClient } from '../../../apollo/client';
import getApyBreakdown from '../common/getApyBreakdown';
import { addressBook } from '../../../../packages/address-book/address-book/';
import { getEDecimals } from '../../../utils/getEDecimals';
import { LpPool } from '../../../types/LpPool';

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
  const pairAddresses = pools
    .filter(pool => pool.platform === 'quickswap') // no trading APR reported for waultswap ATM
    .map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(quickClient, pairAddresses, QUICK_LPF);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, QUICK_LPF);
};

const getFarmApys = async (pools: LpPool[]) => {
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

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
  }
  return apys;
};

const getPoolsData = async (
  pools: LpPool[]
): Promise<{ balances: BigNumber[]; allocPoints: BigNumber[] }> => {
  const chefContract = new web3.eth.Contract(FarmHeroChef_ABI, chef) as unknown as FarmHeroChef;

  const balances: BigNumber[] = [];
  const allocPoints: BigNumber[] = [];
  for (const pool of pools) {
    const poolInfo = await chefContract.methods.poolInfo(pool.poolId.toString()).call();
    const allocPoint = new BigNumber(parseInt(poolInfo.allocPoint));
    const { strat } = poolInfo;
    const stratContract = new web3.eth.Contract(
      IFarmHeroStrategy_ABI,
      strat
    ) as unknown as IFarmHeroStrategy;
    const balanceString = await stratContract.methods.wantLockedTotal().call();
    const balance = new BigNumber(parseInt(balanceString));
    balances.push(balance);
    allocPoints.push(allocPoint);
  }

  return { balances, allocPoints };
};
