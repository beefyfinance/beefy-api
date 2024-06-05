import { getRewardPoolApys } from '../common/getRewardPoolApys';
import pools from '../../../data/matic/uniswapGammaPools.json';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const {
  polygon: {
    tokens: { MATIC },
  },
} = addressBook;

export const getUniswapGammaApys = async () =>
  await getRewardPoolApys({
    pools,
    oracleId: 'WMATIC',
    oracle: 'tokens',
    tokenAddress: MATIC.address,
    decimals: getEDecimals(MATIC.decimals),
    chainId: 137,
    gammaClient: 'https://wire2.gamma.xyz/polygon/hypervisors/allData',
    // tradingFeeInfoClient: verseClient,
    // liquidityProviderFee: VERSE_LPF,
    // log: true,
  });
