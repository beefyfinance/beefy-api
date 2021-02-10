const BigNumber = require('bignumber.js');
const { web3 } = require('../../../utils/web3');

const OriginalGangster = require('../../../abis/OriginalGangster.json');
const ERC20 = require('../../../abis/ERC20.json');
const { getPrice } = require('../../../utils/getPrice');
const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');

const ORIGINAL_GANGSTER = '0x03edb31BeCc296d45670790c947150DAfEC2E238';
const DRUGS_V2 = '0x339550404Ca4d831D12B1b2e4768869997390010';
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

const ORACLE = 'thugs';
const ORACLE_ID = `${DRUGS_V2}_${WBNB}`;

const getBaseDrugsApy = async () => {
  const yearlyRewardsInUsd = await getYearlyRewardsInUsd(ORIGINAL_GANGSTER, ORACLE, ORACLE_ID);
  const totalStakedInUsd = await getTotalStakedInUsd(ORIGINAL_GANGSTER, DRUGS_V2, ORACLE, ORACLE_ID);
  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (originalGangsterAddr, oracle, oracleId) => {
  const fromBlock = await web3.eth.getBlockNumber();
  const toBlock = fromBlock + 1;
  const originalGangsterContract = new web3.eth.Contract(OriginalGangster, originalGangsterAddr);

  const multiplier = new BigNumber(await originalGangsterContract.methods.getMultiplier(fromBlock, toBlock).call());
  const blockRewards = new BigNumber(await originalGangsterContract.methods.drugsPerBlock().call());

  let { allocPoint } = await originalGangsterContract.methods.poolInfo(0).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(
    await originalGangsterContract.methods.totalAllocPoint().call()
  );
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const drugsPrice = await getPrice(oracle, oracleId);
  const yearlyRewardsInUsd = yearlyRewards.times(drugsPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getBaseDrugsApy;
