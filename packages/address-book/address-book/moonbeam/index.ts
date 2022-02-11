import { beefyfinance } from './platforms/beefyfinance';
import { beamswap } from './platforms/beamswap';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _moonbeam = {
  platforms: {
    beefyfinance,
    beamswap,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const moonbeam: ConstInterface<typeof _moonbeam, Chain> = _moonbeam;
