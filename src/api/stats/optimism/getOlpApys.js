const { optimismWeb3: web3 } = require('../../../utils/web3');
const BigNumber = require('bignumber.js');
import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';
import { OPTIMISM_CHAIN_ID } from '../../../constants';

const Distributor = require('../../../abis/arbitrum/Distributor.json');
const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from '../common/getApyBreakdown';
import { getContractWithProvider } from '../../../utils/contractHelper';
import { ERC20_ABI } from '../../../abis/common/ERC20';
const pools = require('../../../data/optimism/olpPools.json');

const DECIMALS = '1e18';
const SECONDS_PER_YEAR = 31536000;

const getOlpApys = async () => {
  let promises = [];
  let farmAprs = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);
  for (const item of values) {
    farmAprs.push(item);
  }

  return getApyBreakdown(pools, 0, farmAprs, 0);
};

const getPoolApy = async pool => {
  const multicall = new MultiCall(web3, multicallAddress(OPTIMISM_CHAIN_ID));
  const OLPContract = getContractWithProvider(ERC20_ABI, pool.OLP, web3);
  const fOLPContract = getContractWithProvider(ERC20_ABI, pool.fOLP, web3);
  const fDistibutorContract = getContractWithProvider(Distributor, pool.fDistributor, web3);
  const fsDistibutorContract = getContractWithProvider(Distributor, pool.fsDistributor, web3);

  const OLPCalls = [];
  const fOLPCalls = [];
  const fDistibutorCalls = [];
  const fsDistibutorCalls = [];

  OLPCalls.push({stakedAmounts: OLPContract.methods.balanceOf(pool.fOLP)});
  fOLPCalls.push({stakedAmounts: fOLPContract.methods.balanceOf(pool.fsOLP)});
  fDistibutorCalls.push({rewardPerSecond: fDistibutorContract.methods.tokensPerInterval()});
  fsDistibutorCalls.push({rewardPerSecond: fsDistibutorContract.methods.tokensPerInterval()});

  const res = await multicall.all([OLPCalls, fOLPCalls, fDistibutorCalls, fsDistibutorCalls]);

  const fStakedAmounts = new BigNumber(res[0].map(v => v.stakedAmounts));
  const fsStakedAmounts = new BigNumber(res[1].map(v => v.stakedAmounts));
  const fRewardPerSecond = new BigNumber(res[2].map(v => v.rewardPerSecond));
  const fsRewardPerSecond = new BigNumber(res[3].map(v => v.rewardPerSecond));
  const fRewardPrice = await fetchPrice({oracle: 'tokens', id: pool.fRewardToken});
  const fsRewardPrice = await fetchPrice({oracle: 'tokens', id: pool.fsRewardToken});
  const OLPPrice = await fetchPrice({oracle: 'lps', id: 'opx-olp'});

  const fYearlyRewardsInUsd = fRewardPerSecond.times(SECONDS_PER_YEAR).times(fRewardPrice).dividedBy(DECIMALS);
  const fApy = fYearlyRewardsInUsd.dividedBy(fStakedAmounts).times(DECIMALS).dividedBy(OLPPrice);

  const fsYearlyRewardsInUsd = fsRewardPerSecond.times(SECONDS_PER_YEAR).times(fsRewardPrice).dividedBy(DECIMALS);
  const fsApy = fsYearlyRewardsInUsd.dividedBy(fsStakedAmounts).times(DECIMALS).dividedBy(OLPPrice);

  return fApy.plus(fsApy);
};

module.exports = { getOlpApys };
