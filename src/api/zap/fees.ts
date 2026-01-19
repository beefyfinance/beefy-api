import { addressBook } from '../../../packages/address-book/src/address-book';
import { ApiChain } from '../../utils/chain';
import { ProviderId } from './swap/providers';
import { ZERO_ADDRESS } from '../../utils/address';
import { Address, getAddress } from 'viem';
import { createCachedFactory } from '../../utils/factory';

export type ZapFee = {
  /** in bps */
  value: number;
  receiver: Address;
};

/** in bps */
const DEFAULT_ZAP_FEE = 0.0005;

const getChainFeeReceiver = createCachedFactory(
  (chain: ApiChain): Address => {
    const beefyPlatform = addressBook[chain].platforms.beefyfinance;
    if (!beefyPlatform) {
      throw new Error(`No Beefy Platform found for chain ${chain}`);
    }

    const receiver = [
      beefyPlatform.treasurySwapper,
      beefyPlatform.treasuryMultisig,
      beefyPlatform.treasury,
    ].find(a => !!a && a !== ZERO_ADDRESS);

    if (!receiver) {
      throw new Error(
        `No fee receiver (treasurySwapper, or treasuryMultisig, or treasury) found for ${chain}`
      );
    }

    return getAddress(receiver);
  },
  chain => chain
);

export const getZapProviderFee = (provider: ProviderId, chain: ApiChain): ZapFee => {
  const receiver = getChainFeeReceiver(chain);

  return {
    value: DEFAULT_ZAP_FEE,
    receiver: receiver,
  };
};
