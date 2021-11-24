import { beefyfinance } from './platforms/beefyfinance';
import { solarbeam } from './platforms/solarbeam';
import { sushi } from './platforms/sushi';
import { finn } from './platforms/finn';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _moonriver = {
  platforms: {
    beefyfinance,
    solarbeam,
    sushi,
    finn,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const moonriver: ConstInterface<typeof _moonriver, Chain> = _moonriver;
