import { ETH_CHAIN_ID as chainId } from '../../../constants';
import getSiloApyData from '../common/getSiloApys';
import { SiloApyParams, SiloPool } from '../common/getSiloApys';

const pools: SiloPool[] = require('../../../data/ethereum/siloPools.json');
const params: SiloApyParams = {
  chainId,
  pools,
  rewardOracleId: 'CRV',
  rewardDecimals: '1e18',
  incentivesController: '0x361384A0d755f972E5Eea26e4F4efBAf976B6461',
  lens: '0x32a4Bcd8DEa5E18a12a50584682f8E4B77fFF2DF',
  // log: true,
};

const getEthSiloApys = async () => {
  return getSiloApyData(params);
};

module.exports = { getEthSiloApys };
