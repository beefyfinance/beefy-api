const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const OriginalGangster = require('../../../abis/OriginalGangster.json');
const ERC20 = require('../../../abis/ERC20.json');
const { getPrice } = require('../../../utils/getPrice');
const getTotalStakedInUsd = require('../../../utils/getTotalStakedInUsd');

const web3 = new Web3(process.env.BSC_RPC);

const getBaseDrugsApy = async () => {
  const originalGangster = '0x03edb31BeCc296d45670790c947150DAfEC2E238';
  const drugs = '0x339550404Ca4d831D12B1b2e4768869997390010';

  const oracle = 'pancake';
  const oracleId = 'DRUGS';

  const yearlyRewardsInUsd = await getYearlyRewardsInUsd(originalGangster);
  const totalStakedInUsd = await getTotalStakedInUsd(originalGangster, drugs, oracle, oracleId);

  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async originalGangsterAddr => {
  const fromBlock = await web3.eth.getBlockNumber();
  const toBlock = fromBlock + 1;
  const originalGangsterContract = new web3.eth.Contract(OriginalGangster, originalGangsterAddr);

  const multiplier = new BigNumber(
    await originalGangsterContract.methods.getMultiplier(fromBlock, toBlock).call()
  );
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

  const drugsPrice = await getPrice('pancake', 'DRUGS');
  const yearlyRewardsInUsd = yearlyRewards.times(drugsPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getBaseDrugsApy;
