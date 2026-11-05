import { addressBook } from '@beefyfinance/blockchain-addressbook';
import { ApiChainId } from '../../../utils/chain.ts';
import { getAeroGaugeApys } from '../common/getAeroGaugeApys.ts';
import volatilePools from '../../../data/optimism/aeroV2LpPools.json' with { type: 'json' };
import stablePools from '../../../data/optimism/aeroV2StableLpPools.json' with { type: 'json' };

const {
  optimism: {
    tokens: { xAERO },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];

const getAeroApys = () =>
  getAeroGaugeApys({
    chainId: ApiChainId.optimism,
    pools,
    rewardOracleId: xAERO.oracleId,
    rewardDecimals: xAERO.decimals,
  });

export default getAeroApys;
