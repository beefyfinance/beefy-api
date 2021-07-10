import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { polygonWeb3 as web3, multicallAddress } from '../../../utils/web3';

import FarmHeroChef from '../../../abis/matic/FarmHeroChef.json';
import ERC20 from '../../../abis/ERC20.json';
import fetchPrice from '../../../utils/fetchPrice';
import pools from '../../../data/matic/farmheroPools.json';
import { POLYGON_CHAIN_ID, QUICK_LPF } from '../../../constants';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { apePolyClient } from '../../../apollo/client';
import getApyBreakdown from '../common/getApyBreakdown';
import { addressBook } from 'blockchain-addressbook';
import { getEDecimals } from '../../../utils/getEDecimals';
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
  const tradingAprs = await getTradingFeeApr(apePolyClient, pairAddresses, QUICK_LPF);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, QUICK_LPF);
};

const getFarmApys = async pools => {
  const apys = [];
  const chefContract = new web3.eth.Contract(FarmHeroChef, chef);
  const heroPerSecond = new BigNumber(await chefContract.methods.bananaPerSecond().call());
  const totalAllocPoint = new BigNumber(await chefContract.methods.totalAllocPoint().call());

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { balances, allocPoints } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = heroPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    // console.log(pool.name, 'staked:', totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf(), apy.valueOf());
  }
  return apys;
};

const getPoolsData = async pools => {
  const chefContract = new web3.eth.Contract(FarmHeroChef, chef);

  const balanceCalls = [];
  const allocPointCalls = [];
  const rewardAllocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(chef),
    });
    allocPointCalls.push({
      allocPoint: chefContract.methods.poolInfo(pool.poolId),
    });
  });

  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));
  const res = await multicall.all([balanceCalls, allocPointCalls, rewardAllocPointCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['2']);
  return { balances, allocPoints };
};
