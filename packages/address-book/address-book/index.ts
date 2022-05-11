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
import { sys } from './sys';
import { emerald } from './emerald';
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
  readonly sys: Chain;
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
  sys,
  emerald,
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
  readonly '57': Chain;
  readonly '42262': Chain;
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
  [ChainId.sys]: sys,
  [ChainId.emerald]: emerald,
} as const;

export const addressBook: ConstRecord<typeof _addressBook, Chain> = _addressBook;

export const addressBookByChainId: ConstRecord<typeof _addressBookByChainId, Chain> =
  _addressBookByChainId;
