import { ApiChainId } from '../../../utils/chain.ts';
import { getSlipstreamPositionPrices } from '../common/getSlipstreamPositionPrices.ts';
import pools from '../../../data/ethereum/aeroClPools.json' with { type: 'json' };

export default async function getAeroPositionPrices(tokenPrices: Record<string, number>) {
  return await getSlipstreamPositionPrices({
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: ApiChainId.ethereum,
    nftManager: '0x4857DB576eE0e45F10525eC59527BfD10beeC60b',
  });
}
