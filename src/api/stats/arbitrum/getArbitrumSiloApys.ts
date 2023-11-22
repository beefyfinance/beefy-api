import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import getSiloApyData from '../common/getSiloApys';
import { SiloApyParams, SiloPool } from '../common/getSiloApys';

const pools: SiloPool[] = require('../../../data/arbitrum/siloPools.json');
const params: SiloApyParams = {
  chainId,
  pools,
  rewardOracleId: 'ARB',
  rewardDecimals: '1e18',
  incentivesController: '0xd592F705bDC8C1B439Bd4D665Ed99C4FaAd5A680',
  lens: '0xBDb843c7a7e48Dc543424474d7Aa63b61B5D9536',
  // log: true,
};

const getArbSiloApys = async () => {
  return getSiloApyData(params);
};

module.exports = { getArbSiloApys };
