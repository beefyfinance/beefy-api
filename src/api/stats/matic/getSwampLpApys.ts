import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { polygonWeb3 as web3, multicallAddress } from '../../../utils/web3';

// abis
const MasterChefAbi = require('../../../abis/matic/SwampMasterChef.json');
const stratContractAbi = require('../../../abis/matic/SwampStrat.json');
import { ERC20, ERC20_ABI } from '../../../abis/common/ERC20';
// json data
const pools = require('../../../data/matic/swampLpPools.json');

import fetchPrice from '../../../utils/fetchPrice';
import { POLYGON_CHAIN_ID, QUICK_LPF } from '../../../constants';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { quickClient } from '../../../apollo/client';
import getApyBreakdown from '../common/getApyBreakdown';
import { addressBook } from '../../../../packages/address-book/address-book/';
import { getEDecimals } from '../../../utils/getEDecimals';

const {
  platforms: { swamp },
  tokens: { pSWAMP },
} = addressBook.polygon;

const chef = '0x4F04e540A51013aFb6761ee73D71d2fB1F29af80';
const oracleId = pSWAMP.symbol;
const oracle = 'tokens';
const DECIMALS = getEDecimals(pSWAMP.decimals);
const secondsPerBlock = 3;
const secondsPerYear = 31536000;

export const getSwampLpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(quickClient, pairAddresses, QUICK_LPF);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, QUICK_LPF);
};

const getFarmApys = async (pools): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];
  const chefContract = new web3.eth.Contract(MasterChefAbi, chef) as unknown as SwampChef;
  const tokenPerBlock = new BigNumber(await chefContract.methods.NATIVEPerBlock().call());
  const totalAllocPoint = new BigNumber(await chefContract.methods.totalAllocPoint().call()); //  enum PoolType { ERC20, ERC721, ERC1155 } // thus ERC20 = 0

  const tokenPrice: number = await fetchPrice({ oracle, id: oracleId });
  const { balances, allocPoints } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy(pool.decimals);
    const poolBlockRewards = tokenPerBlock.times(allocPoints[i]).dividedBy(totalAllocPoint);
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
  const chefContract = new web3.eth.Contract(MasterChefAbi, chef) as unknown as SwampChef;

  const balances: BigNumber[] = [];
  const allocPoints: BigNumber[] = [];
  for (const pool of pools) {
    const poolInfo = await chefContract.methods.poolInfo(pool.poolId.toString()).call();
    const allocPoint = new BigNumber(parseInt(poolInfo.allocPoint));
    const strat = poolInfo.strat;
    var balanceString = '';
    // pSWAMP-MATIC (poolId 1) has a direct farm contract whereas the rest have a view function for the staked balance
    if (pool.poolId !== 1) {
      const stratContract = new web3.eth.Contract(stratContractAbi, strat) as unknown as Strat;
      balanceString = await stratContract.methods.wantLockedTotal().call();
    } else {
      const tokenContract = new web3.eth.Contract(ERC20_ABI, pool.address) as unknown as ERC20;
      balanceString = await tokenContract.methods.balanceOf(strat).call();
    }
    const balance = new BigNumber(parseInt(balanceString));
    balances.push(balance);
    allocPoints.push(allocPoint);
  }

  return { balances, allocPoints };
};
