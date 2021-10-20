import { beefyfinance } from './platforms/beefyfinance';
import { sushiCelo } from './platforms/sushiCelo';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _celo = {
  platforms: {
    beefyfinance,
    sushiCelo,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const celo: ConstInterface<typeof _celo, Chain> = _celo;
