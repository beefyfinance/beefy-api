const { polygonWeb3: web3 } = require('../../../utils/web3');
import { POLYGON_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
import { getCurveFactoryApy } from '../common/curve/getCurveApyData';

import pools from '../../../data/matic/jarvisPools.json';

const getJarvisApys = async () => {
  const pool = '0xAd326c253A84e9805559b73A08724e11E49ca651';
  const tradingAprs = await getCurveFactoryApy(
    pool,
    'https://api.curve.fi/api/getFactoryAPYs-polygon'
  );
  return await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xf8347d0C225e26B45A6ea9a719012F1153D7Ca15',
    tokenPerBlock: 'rwdPerBlock',
    totalAllocPoint: 23,
    hasMultiplier: false,
    pools: pools,
    oracleId: 'DEN',
    oracle: 'lps',
    decimals: '1e18',
    tradingAprs: tradingAprs,
    // log: true,
  });
};

module.exports = { getJarvisApys };


