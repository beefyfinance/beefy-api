import { addressBook } from '@beefyfinance/blockchain-addressbook';
import { ApiChainId } from '../../../utils/chain.ts';
import { getAeroGaugeApys } from '../common/getAeroGaugeApys.ts';
import pools from '../../../data/base/aeroV2LpPools.json' with { type: 'json' };

const {
  base: {
    tokens: { AERO },
  },
} = addressBook;

const getAeroApys = () =>
  getAeroGaugeApys({
    chainId: ApiChainId.base,
    pools,
    rewardOracleId: AERO.oracleId,
    rewardDecimals: AERO.decimals,
  });

export default getAeroApys;
