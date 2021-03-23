const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/julLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../../constants');

const oracle = 'tokens';
const oracleId = 'JULD';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const bifiBnbRewardPool = '0x24AdC534eb39d3B672018E6575C0C4B700Cf9322'; // BIFI-BNB
const juldBnbRewardPool = '0x966D7053337Bfe74b23c2e8C053F96134070d301'; // JULD-BNB
const btcbBnbRewardPool = '0x266a8D094FDAA4292a288407302aB527812ecA07'; // BTCB-BNB
const uniBnbRewardPool = '0x753950497Ace062c0051f83B9A02C79Cad5baaE9'; // UNI-BNB
const dotBnbRewardPool = '0xC976c5f9b9FBF2f876F04049d6719251599B9BC1'; // DOT-BNB
const xvsBnbRewardPool = '0x40673dcF80Ff7be9808aE474cEDA1ebB0453565F'; // XVS-BNB
const twtBnbRewardPool = '0x0647BB38Cc2eb93B6A482e308Cf264806f209bc7'; // TWT-BNB
const vidtBnbRewardPool = '0x8417c58F7D128781D892C6e054ECe64D9D8f6D1F'; // VIDT-BNB
const juldBusdRewardPool = '0x95fbAd16D57acEB172aD659A8c34df32385B0445'; // JUL-BUSD

const getJulLpApys = async () => {
  let poolBifiBnb = pools.filter(pool => pool.name === 'jul-bifi-bnb')[0];
  let poolJuldBnb = pools.filter(pool => pool.name === 'jul-juld-bnb')[0];
  let poolBtcbBnb = pools.filter(pool => pool.name === 'jul-btcb-bnb')[0];
  let poolUniBnb = pools.filter(pool => pool.name === 'jul-uni-bnb')[0];
  let poolDotBnb = pools.filter(pool => pool.name === 'jul-dot-bnb')[0];
  let poolXvsBnb = pools.filter(pool => pool.name === 'jul-xvs-bnb')[0];
  let poolTwtBnb = pools.filter(pool => pool.name === 'jul-twt-bnb')[0];
  let poolVidtBnb = pools.filter(pool => pool.name === 'jul-vidt-bnb')[0];
  let poolJuldBusd = pools.filter(pool => pool.name === 'jul-juld-busd')[0];

  const values = await Promise.all([
    getPoolApy(bifiBnbRewardPool, poolBifiBnb),
    getPoolApy(juldBnbRewardPool, poolJuldBnb),
    getPoolApy(btcbBnbRewardPool, poolBtcbBnb),
    getPoolApy(uniBnbRewardPool, poolUniBnb),
    getPoolApy(dotBnbRewardPool, poolDotBnb),
    getPoolApy(xvsBnbRewardPool, poolXvsBnb),
    getPoolApy(twtBnbRewardPool, poolTwtBnb),
    getPoolApy(vidtBnbRewardPool, poolVidtBnb),
    getPoolApy(juldBusdRewardPool, poolJuldBusd),
  ]);

  let apys = {};
  for (item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

const getPoolApy = async (rewardPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool),
    getTotalLpStakedInUsd(rewardPool, pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async julRewardPool => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, julRewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getJulLpApys;
