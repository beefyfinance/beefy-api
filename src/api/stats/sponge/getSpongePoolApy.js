const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const MasterChef = require('../../../abis/MasterChef.json');
const { getPrice } = require('../../../utils/getPrice');
const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { compound } = require('../../../utils/compound');

const web3 = new Web3(process.env.BSC_RPC);

const getSoakPoolApy = async () => {
  const masterChef = '0x303961805A22d76Bac6B2dE0c33FEB746d82544B';
  const soak = '0x849233FF1aea15D80EF658B2871664C9Ca994063';
  const oracle = 'pancake';
  const oracleId = 'SOAK';

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterChef, oracle, oracleId),
    getTotalStakedInUsd(masterChef, soak, oracle, oracleId),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.94);

  return { 'soak-soak': apy };
};

const getYearlyRewardsInUsd = async (masterChefAddr, oracle, oracleId) => {
  const fromBlock = await web3.eth.getBlockNumber();
  const toBlock = fromBlock + 1;
  const masterChefContract = new web3.eth.Contract(MasterChef, masterChefAddr);

  const multiplier = new BigNumber(
    await masterChefContract.methods.getMultiplier(fromBlock, toBlock).call(),
  );
  const blockRewards = new BigNumber(await masterChefContract.methods.cakePerBlock().call());

  let { allocPoint } = await masterChefContract.methods.poolInfo(0).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterChefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const soakPrice = await getPrice(oracle, oracleId);
  const yearlyRewardsInUsd = yearlyRewards.times(soakPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getSoakPoolApy;
