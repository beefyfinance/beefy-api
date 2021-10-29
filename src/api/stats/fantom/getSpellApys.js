const { fantomWeb3: web3 } = require('../../../utils/web3');
import { FANTOM_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
import { getCurveFactoryApy } from '../common/curve/getCurveApyData';

import axios from 'axios';
import BigNumber from 'bignumber.js';
import SpellMasterChef from '../../../abis/arbitrum/SpellMasterChef.json';

const getSpellApys = async () => {
  const pool = '0x2dd7C9371965472E5A5fD28fbE165007c61439E1';
  const tradingAprs = await getCurveFactoryApy(
    pool,
    'https://api.curve.fi/api/getFactoryAPYs-fantom'
  );
  return await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchefAbi: SpellMasterChef,
    masterchef: '0x37Cf490255082ee50845EA4Ff783Eb9b6D1622ce',
    tokenPerBlock: 'icePerSecond',
    hasMultiplier: false,
    secondsPerBlock: 1,
    allocPointIndex: '4',
    singlePools: [
      {
        name: 'spell-ftm-mim-crv',
        poolId: 0,
        address: pool,
        oracle: 'lps',
        oracleId: 'curve-ftm-mim',
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

module.exports = getSpellApys;
