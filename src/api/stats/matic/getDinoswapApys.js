import { getTradingFeeApr, getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr';
import { dinoClient, quickClient, sushiClient } from '../../../apollo/client';
import { QUICK_LPF, SUSHI_LPF } from '../../../constants';

const { getMasterChefApys } = require('./getMaticMasterChefApys');
const MasterChefAbi = require('../../../abis/matic/DinoMasterChef.json');
const pools = require('../../../data/matic/dinoswapLpPools.json');

const getDinoswapApys = async () => {
  const pairs = pools.map(pool => pool.address);
  const [dinoTradingAprs, sushiTradingAprs, quickTradingAprs] = await Promise.all([
    getTradingFeeAprSushi(dinoClient, pairs, SUSHI_LPF),
    getTradingFeeAprSushi(sushiClient, pairs, SUSHI_LPF),
    getTradingFeeApr(quickClient, pairs, QUICK_LPF),
  ]);
  const tradingAprs = { ...dinoTradingAprs, ...sushiTradingAprs, ...quickTradingAprs };

  return await getMasterChefApys({
    masterchef: '0x1948abC5400Aa1d72223882958Da3bec643fb4E5',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'dinoPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'DINO',
    oracle: 'tokens',
    decimals: '1e18',
    tradingAprs: tradingAprs,
    // log: true,
  });
};

module.exports = getDinoswapApys;
