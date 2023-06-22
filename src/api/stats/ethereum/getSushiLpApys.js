const { ETH_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/ethereum/sushiLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
import { sushiMainnetClient } from '../../../apollo/client';
import { SUSHI_LPF } from '../../../constants';

const {
  ethereum: {
    platforms: { sushi },
  },
} = addressBook;

export const getSushiApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchef: sushi.masterchef,
    tokenPerBlock: 'sushiPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'SUSHI',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: sushiMainnetClient,
    liquidityProviderFee: SUSHI_LPF,
    // log: true,
  });
