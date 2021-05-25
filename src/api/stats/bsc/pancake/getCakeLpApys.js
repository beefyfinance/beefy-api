const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { bscWeb3: web3, multicallAddress } = require('../../../../utils/web3');

const MasterChef = require('../../../../abis/MasterChef.json');
const ERC20 = require('../../../../abis/ERC20.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const pools = require('../../../../data/cakeLpPools.json');
const { compound } = require('../../../../utils/compound');
const { BASE_HPY, BSC_CHAIN_ID } = require('../../../../constants');

const masterchef = '0x73feaa1eE314F8c655E354234017bE2193C9E24E';
const oracle = 'tokens';
const oracleId = 'Cake';
const DECIMALS = '1e18';
const secondsPerBlock = 3;
const secondsPerYear = 31536000;

const getCakeLpApys = async () => {
  let apys = {};

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { multiplier, blockRewards, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints } = await getPoolsData(pools);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = blockRewards
      .times(multiplier)
      .times(allocPoints[i])
      .dividedBy(totalAllocPoint);

    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
    // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
    const item = { [pool.name]: apy };

    apys = { ...apys, ...item };
  }

  return apys;
};

const getMasterChefData = async () => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.cakePerBlock().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { multiplier, blockRewards, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(BSC_CHAIN_ID));
  const balanceCalls = [];
  const allocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
    allocPointCalls.push({
      allocPoint: masterchefContract.methods.poolInfo(pool.poolId),
    });
  });

  const res = await multicall.all([balanceCalls, allocPointCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['1']);
  return { balances, allocPoints };
};

module.exports = { getCakeLpApys };
