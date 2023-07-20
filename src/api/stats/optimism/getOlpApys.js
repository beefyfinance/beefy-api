const BigNumber = require('bignumber.js');
import { OPTIMISM_CHAIN_ID } from '../../../constants';
const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from '../common/getApyBreakdown';
import DistributorAbi from '../../../abis/arbitrum/Distributor';
import ERC20Abi from '../../../abis/ERC20Abi';
import { fetchContract } from '../../rpc/client';
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
  const OLPContract = fetchContract(pool.OLP, ERC20Abi, OPTIMISM_CHAIN_ID);
  const fOLPContract = fetchContract(pool.fOLP, ERC20Abi, OPTIMISM_CHAIN_ID);
  const fDistibutorContract = fetchContract(pool.fDistributor, DistributorAbi, OPTIMISM_CHAIN_ID);
  const fsDistibutorContract = fetchContract(pool.fsDistributor, DistributorAbi, OPTIMISM_CHAIN_ID);

  const res = await Promise.all([
    OLPContract.read.balanceOf([pool.fOLP]),
    fOLPContract.read.balanceOf([pool.fsOLP]),
    fDistibutorContract.read.tokensPerInterval(),
    fsDistibutorContract.read.tokensPerInterval(),
  ]);

  const fStakedAmounts = new BigNumber(res[0].toString());
  const fsStakedAmounts = new BigNumber(res[1].toString());
  const fRewardPerSecond = new BigNumber(res[2].toString());
  const fsRewardPerSecond = new BigNumber(res[3].toString());
  const fRewardPrice = await fetchPrice({ oracle: 'tokens', id: pool.fRewardToken });
  const fsRewardPrice = await fetchPrice({ oracle: 'tokens', id: pool.fsRewardToken });
  const OLPPrice = await fetchPrice({ oracle: 'lps', id: 'opx-olp' });

  const fYearlyRewardsInUsd = fRewardPerSecond
    .times(SECONDS_PER_YEAR)
    .times(fRewardPrice)
    .dividedBy(DECIMALS);
  const fApy = fYearlyRewardsInUsd.dividedBy(fStakedAmounts).times(DECIMALS).dividedBy(OLPPrice);

  const fsYearlyRewardsInUsd = fsRewardPerSecond
    .times(SECONDS_PER_YEAR)
    .times(fsRewardPrice)
    .dividedBy(DECIMALS);
  const fsApy = fsYearlyRewardsInUsd.dividedBy(fsStakedAmounts).times(DECIMALS).dividedBy(OLPPrice);

  return fApy.plus(fsApy);
};

module.exports = { getOlpApys };
