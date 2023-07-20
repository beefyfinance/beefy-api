import { ETH_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';

const pools = require('../../../data/ethereum/synapseLpPools.json');
const { SUSHI_LPF } = require('../../../constants');
const SynapseChef = require('../../../abis/ethereum/SynapseChef.json');
import { addressBook } from '../../../../packages/address-book/address-book';
import { sushiMainnetClient } from '../../../apollo/client';

const {
  ethereum: {
    platforms: { synapse },
  },
} = addressBook;

const getSynapseLpApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchef: synapse.minichef,
    masterchefAbi: SynapseChef,
    tokenPerBlock: 'synapsePerSecond',
    hasMultiplier: false,
    secondsPerBlock: 1,
    allocPointIndex: 2,
    pools: pools,
    oracleId: 'SYN',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: sushiMainnetClient,
    liquidityProviderFee: SUSHI_LPF,
    // log: true,
  });

module.exports = { getSynapseLpApys };
