import { beefyfinance } from './platforms/beefyfinance';
import { sushi } from './platforms/sushi';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _arbitrum = {
  platforms: {
    beefyfinance,
    sushi,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const arbitrum: ConstInterface<typeof _arbitrum, Chain> = _arbitrum;
