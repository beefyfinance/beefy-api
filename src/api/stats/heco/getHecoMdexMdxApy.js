const BigNumber = require('bignumber.js');
const { hecoWeb3: web3, web3Factory } = require('../../../utils/web3');

const BoardRoom = require('../../../abis/heco/mdexWhtBoardRoom.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const ERC20 = require('../../../abis/ERC20.json');
const { getContractWithProvider } = require('../../../utils/contractHelper');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');

const boardroom = '0x9197d717a4F45B672aCacaB4CC0C6e09222f8695';
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
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault('mdex-mdex');
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  //console.log('mdex-mdx', simpleApy.valueOf(), simpleApy, apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { 'mdex-mdx': apy };
};

const getYearlyRewardsInUsd = async () => {
  const boardRoomContract = getContractWithProvider(BoardRoom, boardroom, web3);

  const blockRewards = new BigNumber(await boardRoomContract.methods.whtPerBlock().call());

  let { allocPoint } = await boardRoomContract.methods.poolInfo(1).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await boardRoomContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: 'WHT' });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(128);

  const tokenContract = getContractWithProvider(ERC20, mdx, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(boardroom).call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getHecoMdexMdxApy;
