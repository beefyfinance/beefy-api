import { beefyfinance } from './platforms/beefyfinance';
import { beethovenX } from './platforms/beethovenX';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _optimism = {
  platforms: {
    beefyfinance,
    beethovenX,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const optimism: ConstInterface<typeof _optimism, Chain> = _optimism;
