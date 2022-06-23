const { polygonWeb3: web3 } = require('../../../utils/web3');
import { POLYGON_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getCurveFactoryApy } from '../common/curve/getCurveApyData';

const mai = addressBook.polygon.platforms.mai;

const getMaiCurveApys = async () => {
  const pool = '0x447646e84498552e62eCF097Cc305eaBFFF09308';
  const tradingAprs = await getCurveFactoryApy(
    pool,
    'https://api.curve.fi/api/getFactoryAPYs-polygon'
  );
  return await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: mai.chef2,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: [
      {
        name: 'mai-crv-mai-3pool',
        chainId: chainId,
        poolId: 0,
        address: pool,
        oracle: 'lps',
        oracleId: 'crv-mai-3pool',
        decimals: '1e18',
      },
    ],
    oracleId: 'QI',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 2,
    tradingAprs: tradingAprs,
    liquidityProviderFee: 0.0004,
    // log: true,
  });
};

module.exports = getMaiCurveApys;
