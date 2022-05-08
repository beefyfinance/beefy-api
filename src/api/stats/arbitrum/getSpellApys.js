const { arbitrumWeb3: web3 } = require('../../../utils/web3');
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
import { getCurveFactoryApy } from '../common/curve/getCurveApyData';

import SpellMasterChef from '../../../abis/arbitrum/SpellMasterChef.json';

const getSpellApys = async () => {
  const pool = '0x30df229cefa463e991e29d42db0bae2e122b2ac7';
  const tradingAprs = await getCurveFactoryApy(
    pool,
    'https://api.curve.fi/api/getFactoryAPYs-arbitrum'
  );
  return await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchefAbi: SpellMasterChef,
    masterchef: '0x839De324a1ab773F76a53900D70Ac1B913d2B387',
    tokenPerBlock: 'icePerSecond',
    hasMultiplier: false,
    secondsPerBlock: 1,
    allocPointIndex: '4',
    singlePools: [
      {
        name: 'spell-mim-crv',
        poolId: 0,
        address: pool,
        oracle: 'lps',
        oracleId: 'curve-arb-mim',
        decimals: '1e18',
      },
    ],
    oracleId: 'SPELL',
    oracle: 'tokens',
    decimals: '1e18',
    tradingAprs: tradingAprs,
    liquidityProviderFee: 0.0002,
    // log: true,
  });
};

module.exports = { getSpellApys };
