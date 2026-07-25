import { arbitrum } from '@beefyfinance/blockchain-addressbook/arbitrum';
import { avax } from '@beefyfinance/blockchain-addressbook/avax';
import { base } from '@beefyfinance/blockchain-addressbook/base';
import { bsc } from '@beefyfinance/blockchain-addressbook/bsc';
import { linea } from '@beefyfinance/blockchain-addressbook/linea';
import { lisk } from '@beefyfinance/blockchain-addressbook/lisk';
import { mode } from '@beefyfinance/blockchain-addressbook/mode';
import { optimism } from '@beefyfinance/blockchain-addressbook/optimism';
import { robinhood } from '@beefyfinance/blockchain-addressbook/robinhood';
import { scroll } from '@beefyfinance/blockchain-addressbook/scroll';
import { sonic } from '@beefyfinance/blockchain-addressbook/sonic';
import type { AnyCowClm, CowProvider } from './types.ts';

export const providers = {
  ramses: {
    poolTradingRewardTokens: {
      arbitrum: [arbitrum.tokens.RAM, arbitrum.tokens.ARB],
    },
  },
  pancakeswap: {
    poolTradingRewardTokens: {
      arbitrum: [arbitrum.tokens.CAKE],
      bsc: [bsc.tokens.CAKE],
      base: [base.tokens.CAKE],
    },
  },
  velodrome: {
    poolTradingRewardTokens: {
      optimism: [optimism.tokens.VELOV2],
      mode: [mode.tokens.XVELO],
      lisk: [lisk.tokens.XVELO],
    },
  },
  aerodrome: {
    poolTradingRewardTokens: {
      base: [base.tokens.AERO],
    },
  },
  nile: {
    poolTradingRewardTokens: {
      linea: [linea.tokens.NILE],
    },
  },
  pharaoh: {
    poolTradingRewardTokens: {
      avax: [avax.tokens.PHAR, avax.tokens.sAVAX, avax.tokens.ggAVAX],
    },
  },
  nuri: {
    poolTradingRewardTokens: {
      scroll: [scroll.tokens.NURI],
    },
  },
  shadow: {
    poolTradingRewardTokens: {
      sonic: [sonic.tokens.SHADOW, sonic.tokens.GEMS],
    },
  },
  etherex: {
    poolTradingRewardTokens: {
      linea: [linea.tokens.REX],
    },
  },
  up33: {
    poolTradingRewardTokens: {
      robinhood: [robinhood.tokens.UP33],
    },
  },
} as const satisfies Record<string, CowProvider>;

export function getCowProvider(providerId: string | undefined): CowProvider | undefined {
  return providerId ? providers[providerId] : undefined;
}

export function getCowProviderForClm(clm: AnyCowClm): CowProvider | undefined {
  return getCowProvider(clm.providerId);
}
