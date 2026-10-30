import { addressBook } from '@beefyfinance/blockchain-addressbook';
import { ApiChainId } from '../../../utils/chain.ts';
import { getAeroGaugeApys } from '../common/getAeroGaugeApys.ts';
import pools from '../../../data/optimism/aeroLpPools.json' with { type: 'json' };

const {
  optimism: {
    tokens: { xAERO },
  },
} = addressBook;

const getAeroApys = () =>
  getAeroGaugeApys({
    chainId: ApiChainId.optimism,
    pools,
    rewardOracleId: xAERO.oracleId,
    rewardDecimals: xAERO.decimals,
    secondsPerBlock: 2,
  });

export default getAeroApys;
