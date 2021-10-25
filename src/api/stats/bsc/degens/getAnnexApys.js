const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const MasterChef = require('../../../../abis/degens/AnnexChef.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const lpPools = require('../../../../data/degens/annexLpPools.json');
const { compound } = require('../../../../utils/compound');

const getAnnexApys = async () => {
  let apys = {};
  const masterchef = '0x9c821500eaBa9f9737fDAadF7984Dff03edc74d1';

  let promises = [];
  const pools = [
    ...lpPools,
    {
      name: 'annex-ann',
      poolId: 2,
      address: '0x98936Bde1CF1BFf1e7a8012Cee5e2583851f2067',
      oracle: 'tokens',
      oracleId: 'ANN',
      decimals: '1e18',
    },
  ];
  pools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, pool) => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const blockRewards = new BigNumber(await masterchefContract.methods.annexPerBlock().call());
  let { lpSupply, allocPoint } = await masterchefContract.methods.getPoolInfo(pool.poolId).call();
  lpSupply = new BigNumber(lpSupply);
  allocPoint = new BigNumber(allocPoint);

  const stakedPrice = await fetchPrice({
    oracle: pool.oracle ?? 'lps',
    id: pool.oracleId ?? pool.name,
  });
  const totalStakedInUsd = lpSupply.times(stakedPrice).dividedBy(pool.decimals);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'ANN' });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);

  // console.log(pool.name, simpleApy.valueOf(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());

  return { [pool.name]: apy };
};

module.exports = getAnnexApys;
