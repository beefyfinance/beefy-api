const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const BoardRoom = require('../../../../abis/mdexBoardRoom.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');

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
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  //console.log('mdex-bsc-mdx', simpleApy.valueOf(), simpleApy, apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { 'mdex-bsc-mdx': apy };
};

const getYearlyRewardsInUsd = async () => {
  const boardRoomContract = new web3.eth.Contract(BoardRoom, boardroom);

  const blockRewards = new BigNumber(await boardRoomContract.methods.wbnbPerBlock().call());

  let { allocPoint } = await boardRoomContract.methods.poolInfo(0).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await boardRoomContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: 'WBNB' });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getMdexMdxApy;
