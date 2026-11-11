import { addressBook } from '@beefyfinance/blockchain-addressbook';
import { ApiChainId } from '../../../utils/chain.ts';
import { getAeroGaugeApys } from '../common/getAeroGaugeApys.ts';

const {
  ethereum: {
    tokens: { xAERO },
  },
} = addressBook;

const getAeroApys = () =>
  getAeroGaugeApys({
    chainId: ApiChainId.ethereum,
    pools: [],
    rewardOracleId: xAERO.oracleId,
    rewardDecimals: xAERO.decimals,
  });

export default getAeroApys;
