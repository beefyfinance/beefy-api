import { ape } from './platforms/ape';
import { chainlink } from './platforms/chainlink';
import { bakery } from './platforms/bakery';
import { beefyfinance } from './platforms/beefyfinance';
import { pancake } from './platforms/pancake';
import { ironfinance } from './platforms/ironfinance';
import { farmhero } from './platforms/farmhero';
import { ellipsis } from './platforms/ellipsis';
import { elk } from './platforms/elk';
import { wault } from './platforms/wault';
import { kebab } from './platforms/kebab';
import { jet } from './platforms/jet';
import { mdex } from './platforms/mdex';
import { biswap } from './platforms/biswap';
import { emp } from './platforms/emp';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _bsc = {
  platforms: {
    ape,
    chainlink,
    bakery,
    beefyfinance,
    pancake,
    ironfinance,
    farmhero,
    ellipsis,
    elk,
    wault,
    kebab,
    jet,
    mdex,
    biswap,
    emp,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
};

export const bsc: ConstInterface<typeof _bsc, Chain> = _bsc;
