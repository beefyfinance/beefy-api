import { ChainId } from '@beefyfinance/blockchain-addressbook';

const BASE_HPY = 2190;
const DAILY_HPY = 365;

/// Chain IDs
const BSC_CHAIN_ID = ChainId.bsc;
const POLYGON_CHAIN_ID = ChainId.polygon;
const AVAX_CHAIN_ID = ChainId.avax;
const ARBITRUM_CHAIN_ID = ChainId.arbitrum;
const OPTIMISM_CHAIN_ID = ChainId.optimism;
const ETH_CHAIN_ID = ChainId.ethereum;
const BASE_CHAIN_ID = ChainId.base;
const GNOSIS_CHAIN_ID = ChainId.gnosis;
const LINEA_CHAIN_ID = ChainId.linea;
const MANTLE_CHAIN_ID = ChainId.mantle;
const FRAXTAL_CHAIN_ID = ChainId.fraxtal;
const LISK_CHAIN_ID = ChainId.lisk;
const SONIC_CHAIN_ID = ChainId.sonic;
const BERACHAIN_CHAIN_ID = ChainId.berachain;
const HYPEREVM_CHAIN_ID = ChainId.hyperevm;
const PLASMA_CHAIN_ID = ChainId.plasma;
const MONAD_CHAIN_ID = ChainId.monad;
const MEGAETH_CHAIN_ID = ChainId.megaeth;
const ROBINHOOD_CHAIN_ID = ChainId.robinhood;
const ARC_CHAIN_ID = ChainId.arc;

const EXCLUDED_IDS_FROM_TVL = ['venus-wbnb'];

export {
  ARBITRUM_CHAIN_ID,
  ARC_CHAIN_ID,
  AVAX_CHAIN_ID,
  BASE_CHAIN_ID,
  BASE_HPY,
  BERACHAIN_CHAIN_ID,
  BSC_CHAIN_ID,
  DAILY_HPY,
  ETH_CHAIN_ID,
  EXCLUDED_IDS_FROM_TVL,
  FRAXTAL_CHAIN_ID,
  GNOSIS_CHAIN_ID,
  HYPEREVM_CHAIN_ID,
  LINEA_CHAIN_ID,
  LISK_CHAIN_ID,
  MANTLE_CHAIN_ID,
  MEGAETH_CHAIN_ID,
  MONAD_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
  PLASMA_CHAIN_ID,
  POLYGON_CHAIN_ID,
  ROBINHOOD_CHAIN_ID,
  SONIC_CHAIN_ID,
};
