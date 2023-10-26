import { beefyfinance } from './platforms/beefyfinance';
import { sushi } from './platforms/sushi';
import { swapfish } from './platforms/swapfish';
import { balancer } from './platforms/balancer';
import { solidlizard } from './platforms/solidlizard';
import { ramses } from './platforms/ramses';
import { arbidex } from './platforms/arbidex';
import { chronos } from './platforms/chronos';
import { bunni } from './platforms/bunni';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _arbitrum = {
  platforms: {
    beefyfinance,
    sushi,
    swapfish,
    balancer,
    solidlizard,
    ramses,
    arbidex,
    chronos,
    bunni,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const arbitrum: ConstInterface<typeof _arbitrum, Chain> = _arbitrum;
