import { beefyfinance } from './platforms/beefyfinance';
import { balancer } from './platforms/balancer';
import { aura } from './platforms/aura';
import { sushi } from './platforms/sushi';
import { synapse } from './platforms/synapse';
import { solidly } from './platforms/solidly';

import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _ethereum = {
  platforms: {
    beefyfinance,
    balancer,
    aura,
    sushi,
    synapse,
    solidly,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
};
export const ethereum: ConstInterface<typeof _ethereum, Chain> = _ethereum;
