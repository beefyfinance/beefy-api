import { addressBook } from '../../../packages/address-book/src/address-book';
import { ApiChain } from '../../utils/chain';
import { ProviderId } from './swap/providers';

export type ZapFee = {
  value: number;
  receiver?: string;
};

const DEFAULT_ZAP_FEE = 0.0005;
export const getZapProviderFee = (provider: ProviderId, chain: ApiChain) => {
  if (provider === 'odos')
    return {
      value: DEFAULT_ZAP_FEE,
    }; //It's static to the odos code config, we can't make it dynamic

  const beefyPlatform = addressBook[chain].platforms.beefyfinance;
  if (!beefyPlatform) {
    throw new Error('No Beefy Platform found for chain ' + chain);
  }

  const receiver = beefyPlatform.treasurySwapper || beefyPlatform.treasuryMultisig || beefyPlatform.treasury;
  return {
    value: DEFAULT_ZAP_FEE,
    receiver: receiver,
  };
};
