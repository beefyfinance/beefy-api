import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { polygonWeb3 as web3, multicallAddress } from '../../../utils/web3';

// abis
import { ContractContext as FarmHeroChef, FarmHeroChef_ABI } from '../../../abis/matic/FarmHero';
import { ContractContext as ERC20, ERC20_ABI } from '../../../abis/common/ERC20';
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
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(quickClient, pairAddresses, QUICK_LPF);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, QUICK_LPF);
};

const getFarmApys = async (pools: LpPool[]) => {
  const apys = [];
  const chefContract = (new web3.eth.Contract(FarmHeroChef_ABI, chef) as unknown) as FarmHeroChef;
  const heroPerSecond = new BigNumber(await chefContract.methods.HERORewardPerSecond().call());
  const totalAllocPoint = new BigNumber(await chefContract.methods.totalAllocPoint(0).call()); //  enum PoolType { ERC20, ERC721, ERC1155 }

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { balances, allocPoints } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy(pool.decimals);

    const poolBlockRewards = heroPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
  }
  return apys;
};

const getPoolsData = async (pools: LpPool[]) => {
  const chefContract = (new web3.eth.Contract(FarmHeroChef_ABI, chef) as unknown) as FarmHeroChef;

  const balanceCalls = [];
  const allocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = (new web3.eth.Contract(ERC20_ABI, pool.address) as unknown) as ERC20;
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(chef),
    });
    allocPointCalls.push({
      allocPoint: chefContract.methods.poolInfo(pool.poolId.toString()),
    });
  });

  const multicall = new MultiCall(web3 as any, multicallAddress(POLYGON_CHAIN_ID));
  const res = await multicall.all([balanceCalls, allocPointCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPointPropertyPosition = '2';
  const allocPoints = res[1].map(v => v.allocPoint[allocPointPropertyPosition]);
  return { balances, allocPoints };
};
