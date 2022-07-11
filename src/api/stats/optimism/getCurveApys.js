import { MultiCall } from 'eth-multicall';

const { optimismWeb3: web3 } = require('../../../utils/web3');

import {
  getCurveBaseApys,
  getCurveBaseApysOld,
  getTotalStakedInUsd,
  getYearlyRewardsInUsd,
} from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import { multicallAddress } from '../../../utils/web3';
import { OPTIMISM_CHAIN_ID } from '../../../constants';

const pools = require('../../../data/optimism/curvePools.json');
// subpgraph api is broken, factoryApy returns 0
// const baseApyUrl = 'https://api.curve.fi/api/getSubgraphData/optimism';
const baseApyUrl = 'https://stats.curve.fi/raw-stats-optimism/apys.json';
const factoryApyUrl = 'https://api.curve.fi/api/getFactoryAPYs-optimism';
const tradingFees = 0.0002;

const getCurveApys = async () => {
  const baseApys = await getCurveBaseApysOld(pools, baseApyUrl, factoryApyUrl);
  const farmApys = await getPoolApys(pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const getPoolApys = async pools => {
  const apys = [];

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);
  values.forEach(item => apys.push(item));

  return apys;
};

const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(OPTIMISM_CHAIN_ID)), pool),
    getTotalStakedInUsd(web3, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  // console.log(pool.name, simpleApy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return simpleApy;
};

const newGauges = [
  {
    name: 'curve-op-f-sbtc',
    pool: '0x9F2fE3500B1a7E285FDc337acacE94c480e00130',
    token: '0x9F2fE3500B1a7E285FDc337acacE94c480e00130',
    oracleId: 'WBTC',
    gauge: '0x172a5AF37f69C69CC59E748D090a70615830A5Dd',
    boosted: true,
    tokens: [
      {
        oracle: 'tokens',
        oracleId: 'sBTC',
        decimals: '1e18',
      },
      {
        oracle: 'tokens',
        oracleId: 'WBTC',
        decimals: '1e8',
      },
    ],
  },
  {
    name: 'curve-op-f-seth',
    pool: '0x7Bc5728BC2b59B45a58d9A576E2Ffc5f0505B35E',
    token: '0x7Bc5728BC2b59B45a58d9A576E2Ffc5f0505B35E',
    oracleId: 'WETH',
    gauge: '0xCB8883D1D8c560003489Df43B30612AAbB8013bb',
    boosted: true,
    tokens: [
      {
        oracle: 'tokens',
        oracleId: 'WETH',
        decimals: '1e18',
      },
      {
        oracle: 'tokens',
        oracleId: 'sETH',
        decimals: '1e18',
      },
    ],
  },
];

module.exports = getCurveApys;
