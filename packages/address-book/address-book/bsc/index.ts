import { ape } from './platforms/ape';
import { beefyfinance } from './platforms/beefyfinance';
import { pancake } from './platforms/pancake';
import { ironfinance } from './platforms/ironfinance';
import { farmhero } from './platforms/farmhero';
import { ellipsis } from './platforms/ellipsis';
import { wault } from './platforms/wault';
import { kebab } from './platforms/kebab';
import { jet } from './platforms/jet';
import { mdex } from './platforms/mdex';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _bsc = {
  platforms: {
    ape,
    beefyfinance,
    pancake,
    ironfinance,
    farmhero,
    ellipsis,
    wault,
    kebab,
    jet,
    mdex,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
};

export const bsc: ConstInterface<typeof _bsc, Chain> = _bsc;
