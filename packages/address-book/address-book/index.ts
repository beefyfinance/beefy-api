import { polygon } from './polygon';
import { bsc } from './bsc';
import { avax } from './avax';
import { fantom } from './fantom';
import { heco } from './heco';
import { one } from './one';
import { arbitrum } from './arbitrum';
import { celo } from './celo';
import { moonriver } from './moonriver';
import { cronos } from './cronos';
import { aurora } from './aurora';
import { fuse } from './fuse';
import { metis } from './metis';
import { moonbeam } from './moonbeam';
import { emerald } from './emerald';
import { optimism } from './optimism';
import { kava } from './kava';
import { ethereum } from './ethereum';
import { canto } from './canto';
import { zksync } from './zksync';
import { zkevm } from './zkevm';
import { base } from './base';
import { gnosis } from './gnosis';
import { linea } from './linea';
import { mantle } from './mantle';
import Chain from '../types/chain';
import { ChainId } from '../types/chainid';
import { ConstRecord } from '../types/const';

export * from '../types/chainid';

const _addressBook: {
  readonly avax: Chain;
  readonly fantom: Chain;
  readonly one: Chain;
  readonly metis: Chain;
  readonly moonbeam: Chain;
  readonly celo: Chain;
  readonly aurora: Chain;
  readonly moonriver: Chain;
  readonly fuse: Chain;
  readonly bsc: Chain;
  readonly polygon: Chain;
  readonly cronos: Chain;
  readonly heco: Chain;
  readonly arbitrum: Chain;
  readonly emerald: Chain;
  readonly optimism: Chain;
  readonly kava: Chain;
  readonly ethereum: Chain;
  readonly canto: Chain;
  readonly zksync: Chain;
  readonly zkevm: Chain;
  readonly base: Chain;
  readonly gnosis: Chain;
  readonly linea: Chain;
  readonly mantle: Chain;
} = {
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
} as const;

const _addressBookByChainId: {
  readonly '56': Chain;
  readonly '43114': Chain;
  readonly '25': Chain;
  readonly '42220': Chain;
  readonly '1088': Chain;
  readonly '1285': Chain;
  readonly '1284': Chain;
  readonly '250': Chain;
  readonly '1666600000': Chain;
  readonly '122': Chain;
  readonly '137': Chain;
  readonly '128': Chain;
  readonly '1313161554': Chain;
  readonly '42161': Chain;
  readonly '42262': Chain;
  readonly '10': Chain;
  readonly '2222': Chain;
  readonly '1': Chain;
  readonly '7700': Chain;
  readonly '324': Chain;
  readonly '1101': Chain;
  readonly '8453': Chain;
  readonly '100': Chain;
  readonly '59144': Chain;
  readonly '5000': Chain;
} = {
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
} as const;

export const addressBook: ConstRecord<typeof _addressBook, Chain> = _addressBook;

export const addressBookByChainId: ConstRecord<typeof _addressBookByChainId, Chain> =
  _addressBookByChainId;
