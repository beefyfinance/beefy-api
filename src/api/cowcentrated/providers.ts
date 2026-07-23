import { arbitrum } from '../../../packages/address-book/src/address-book/arbitrum/index.ts';
import { avax } from '../../../packages/address-book/src/address-book/avax/index.ts';
import { base } from '../../../packages/address-book/src/address-book/base/index.ts';
import { bsc } from '../../../packages/address-book/src/address-book/bsc/index.ts';
import { linea } from '../../../packages/address-book/src/address-book/linea/index.ts';
import { lisk } from '../../../packages/address-book/src/address-book/lisk/index.ts';
import { mode } from '../../../packages/address-book/src/address-book/mode/index.ts';
import { optimism } from '../../../packages/address-book/src/address-book/optimism/index.ts';
import { robinhood } from '../../../packages/address-book/src/address-book/robinhood/index.ts';
import { scroll } from '../../../packages/address-book/src/address-book/scroll/index.ts';
import { sonic } from '../../../packages/address-book/src/address-book/sonic/index.ts';
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
