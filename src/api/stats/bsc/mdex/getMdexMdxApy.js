const BigNumber = require('bignumber.js');

const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { getTotalPerformanceFeeForVault } = require('../../../vaults/getVaultFees');
const { default: mdexBoardRoom } = require('../../../../abis/mdexBoardRoom');
const { BSC_CHAIN_ID } = require('../../../../constants');
const { fetchContract } = require('../../../rpc/client');

const boardroom = '0xDF484250C063C46F2E1F228954F82266CB987D78';
const mdx = '0x9C65AB58d8d978DB963e63f2bfB7121627e3a739';
const oracleId = 'MDX';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getMdexMdxApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(boardroom, mdx, oracle, oracleId),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault('mdex-bsc-mdx');
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  //console.log('mdex-bsc-mdx', simpleApy.valueOf(), simpleApy, apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { 'mdex-bsc-mdx': apy };
};

const getYearlyRewardsInUsd = async () => {
  const boardRoomContract = fetchContract(boardroom, mdexBoardRoom, BSC_CHAIN_ID);

  const [blockRewards, , allocPoint, totalAllocPoint] = await Promise.all([
    boardRoomContract.read.wbnbPerBlock().then(res => new BigNumber(res.toString())),
    boardRoomContract.read.poolInfo([0]).then(res => new BigNumber(res[1].toString())),
    boardRoomContract.read.totalAllocPoint().then(res => new BigNumber(res.toString())),
  ]);

  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: 'WBNB' });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getMdexMdxApy;
