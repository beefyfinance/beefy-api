import type { Chain } from '../types/chain.js';
import type { ReadonlyRecord } from '../types/readonly-record.js';
import { ChainId, type ChainIdKey } from '../types/chainid.js';
import { polygon } from './polygon/index.js';
import { bsc } from './bsc/index.js';
import { avax } from './avax/index.js';
import { fantom } from './fantom/index.js';
import { heco } from './heco/index.js';
import { one } from './one/index.js';
import { arbitrum } from './arbitrum/index.js';
import { celo } from './celo/index.js';
import { moonriver } from './moonriver/index.js';
import { cronos } from './cronos/index.js';
import { aurora } from './aurora/index.js';
import { fuse } from './fuse/index.js';
import { metis } from './metis/index.js';
import { moonbeam } from './moonbeam/index.js';
import { emerald } from './emerald/index.js';
import { optimism } from './optimism/index.js';
import { kava } from './kava/index.js';
import { ethereum } from './ethereum/index.js';
import { canto } from './canto/index.js';
import { zksync } from './zksync/index.js';
import { zkevm } from './zkevm/index.js';
import { base } from './base/index.js';
import { gnosis } from './gnosis/index.js';
import { linea } from './linea/index.js';
import { mantle } from './mantle/index.js';
import { fraxtal } from './fraxtal/index.js';
import { mode } from './mode/index.js';
import { manta } from './manta/index.js';
import { real } from './real/index.js';
import { sei } from './sei/index.js';
import { rootstock } from './rootstock/index.js';

export { ChainId }; // enum which is compiled to a JS object
export type { Chain };
export type { Token, TokenWithId } from '../types/token.js';

export const addressBook: ReadonlyRecord<ChainIdKey, Chain> = {
  polygon,
  bsc,
  avax,
  fantom,
  heco,
  one,
  arbitrum,
  celo,
  moonriver,
  cronos,
  aurora,
  fuse,
  metis,
  moonbeam,
  emerald,
  optimism,
  kava,
  ethereum,
  canto,
  zksync,
  zkevm,
  base,
  gnosis,
  linea,
  mantle,
  fraxtal,
  mode,
  manta,
  real,
  sei,
  rootstock,
} as const;

export const addressBookByChainId: ReadonlyRecord<`${ChainId}`, Chain> = {
  [ChainId.polygon]: polygon,
  [ChainId.bsc]: bsc,
  [ChainId.avax]: avax,
  [ChainId.fantom]: fantom,
  [ChainId.heco]: heco,
  [ChainId.one]: one,
  [ChainId.arbitrum]: arbitrum,
  [ChainId.celo]: celo,
  [ChainId.moonriver]: moonriver,
  [ChainId.cronos]: cronos,
  [ChainId.aurora]: aurora,
  [ChainId.fuse]: fuse,
  [ChainId.metis]: metis,
  [ChainId.moonbeam]: moonbeam,
  [ChainId.emerald]: emerald,
  [ChainId.optimism]: optimism,
  [ChainId.kava]: kava,
  [ChainId.ethereum]: ethereum,
  [ChainId.canto]: canto,
  [ChainId.zksync]: zksync,
  [ChainId.zkevm]: zkevm,
  [ChainId.base]: base,
  [ChainId.gnosis]: gnosis,
  [ChainId.linea]: linea,
  [ChainId.mantle]: mantle,
  [ChainId.fraxtal]: fraxtal,
  [ChainId.mode]: mode,
  [ChainId.manta]: manta,
  [ChainId.real]: real,
  [ChainId.sei]: sei,
  [ChainId.rootstock]: rootstock,
} as const;
