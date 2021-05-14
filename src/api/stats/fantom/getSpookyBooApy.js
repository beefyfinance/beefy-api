const BigNumber = require('bignumber.js');
const { fantomWeb3: web3, web3Factory } = require('../../../utils/web3');

const MasterChef = require('../../../abis/fantom/SpookyIFO.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');

const ERC20 = require('../../../abis/ERC20.json');

const masterchef = '0xACACa07e398d4946AD12232F40f255230e73Ca72';
const boo = '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE';
const oracleId = 'BOO';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getSpookyBooApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  //console.log('boo-boo', simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { 'boo-boo': apy };
};

const getYearlyRewardsInUsd = async () => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const rewards = new BigNumber(await masterchefContract.methods.booPerSecond().call());

  let { allocPoint } = await masterchefContract.methods.poolInfo(0).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = rewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 1;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(250);

  const tokenContract = new web3.eth.Contract(ERC20, boo);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(masterchef).call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

module.exports = getSpookyBooApy;
