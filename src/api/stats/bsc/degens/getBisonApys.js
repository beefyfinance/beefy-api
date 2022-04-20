const { bscWeb3: web3 } = require('../../../../utils/web3');
const BigNumber = require('bignumber.js');

const BisonRewardPool = require('../../../../abis/degens/BisonRewardPool.json');
const ERC20 = require('../../../../abis/common/ERC20/ERC20.json');
const lpPools = require('../../../../data/degens/bisonLpPools.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
const { apeClient } = require('../../../../apollo/client');
import { APE_LPF } from '../../../../constants';
import { getContractWithProvider } from '../../../../utils/contractHelper';
import getApyBreakdown from '../../common/getApyBreakdown';

const oracleId = 'BISON';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getBisonApys = async () => {
  const pools = [
    ...lpPools,
    {
      name: 'bison-bison',
      address: '0x19A6Da6e382b85F827088092a3DBe864d9cCba73',
      rewardPool: '0x5963Df2e4E65435d1C75b2339de8Ee1Cb5656633',
      oracle: 'tokens',
      oracleId: 'BISON',
      decimals: '1e18',
    },
  ];

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const farmAprs = await Promise.all(promises);

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(apeClient, pairAddresses, APE_LPF);

  return getApyBreakdown(pools, tradingAprs, farmAprs, APE_LPF);
};

const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalStakedInUsd(pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  // console.log(pool.name,totalStakedInUsd.valueOf(),yearlyRewardsInUsd.valueOf(),simpleApy.valueOf());
  return simpleApy;
};

const getTotalStakedInUsd = async pool => {
  const contract = getContractWithProvider(ERC20, pool.address, web3);
  const staked = new BigNumber(await contract.methods.balanceOf(pool.rewardPool).call());
  const price = await fetchPrice({ oracle: pool.oracle || 'lps', id: pool.oracleId || pool.name });
  return staked.times(price).dividedBy(pool.decimals);
};

const getYearlyRewardsInUsd = async pool => {
  const contract = getContractWithProvider(BisonRewardPool, pool.rewardPool, web3);

  const rewardPerBlock = new BigNumber(await contract.methods.rewardPerBlock().call());

  const secondsPerYear = 31536000;
  const yearlyRewards = rewardPerBlock.times(secondsPerYear).dividedBy(3);

  const price = await fetchPrice({ oracle: oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(price).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getBisonApys;
