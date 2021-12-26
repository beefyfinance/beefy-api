const { avaxWeb3: web3 } = require('../../../utils/web3');
import { AVAX_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
import { addressBook } from '../../../../packages/address-book/address-book';

import axios from 'axios';
import BigNumber from 'bignumber.js';
import MasterChefAbi from '../../../abis/matic/MaiFarmChef.json';
const mai = addressBook.avax.platforms.mai;

const getMaiCurveApys = async () => {
  const pool = '0xb0D2EB3C2cA3c6916FAb8DCbf9d9c165649231AE';
  const tradingAprs = await getCurveBaseApy(pool);
  return await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchefAbi: MasterChefAbi,
    masterchef: mai.chef,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: [
      {
        name: 'mai-avax-mai-crv',
        poolId: 0,
        address: pool,
        oracle: 'lps',
        oracleId: 'curve-avax-mai',
        decimals: '1e18',
      },
    ],
    oracleId: 'avaxQI',
    oracle: 'tokens',
    decimals: '1e18',
    tradingAprs: tradingAprs,
    liquidityProviderFee: 0.0002,
    // log: true,
  });
};

const getCurveBaseApy = async address => {
  let apys = {};
  try {
    const response = await axios.get('https://api.curve.fi/api/getFactoryAPYs-avalanche');
    const pools = response.data.data.poolDetails;
    pools.forEach(pool => {
      if (pool.poolAddress.toLowerCase() === address.toLowerCase()) {
        const apy = new BigNumber(pool.apy).dividedBy(100);
        apys = { ...apys, ...{ [address.toLowerCase()]: apy } };
      }
    });
  } catch (err) {
    console.error(err);
  }
  return apys;
};

module.exports = getMaiCurveApys;
