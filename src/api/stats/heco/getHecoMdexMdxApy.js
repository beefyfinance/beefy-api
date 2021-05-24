const BigNumber = require('bignumber.js');
const { hecoWeb3: web3, web3Factory } = require('../../../utils/web3');

const BoardRoom = require('../../../abis/BoardRoom.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const ERC20 = require('../../../abis/ERC20.json');

const boardroom = '0x19D054836192200c71EEc12Bc9f255b1faE8eE80';
const mdx = '0x25D2e80cB6B86881Fd7e07dd263Fb79f4AbE033c';
const oracleId = 'MDX';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getHecoMdexMdxApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  //console.log('mdex-mdx', simpleApy.valueOf(), simpleApy, apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { 'mdex-mdx': apy };
};

const getYearlyRewardsInUsd = async () => {
  const boardRoomContract = new web3.eth.Contract(BoardRoom, boardroom);

  const blockRewards = new BigNumber(await boardRoomContract.methods.mdxPerBlock().call());

  let { allocPoint } = await boardRoomContract.methods.poolInfo(0).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await boardRoomContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(128);

  const tokenContract = new web3.eth.Contract(ERC20, mdx);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(boardroom).call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getHecoMdexMdxApy;
