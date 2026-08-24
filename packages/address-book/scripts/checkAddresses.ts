import { getAddress, isAddress } from 'viem';
import { addressBook } from '../src/address-book/index.js';

type ChainId = keyof typeof addressBook;
const allChains = Object.keys(addressBook) as ChainId[];

function isChainId(chainId: string): chainId is ChainId {
  return !!addressBook[chainId as ChainId];
}

/** Checks every token address is a valid, EIP-55 checksummed 20-byte hex address. */
function checkChain(chainId: ChainId) {
  const { tokens } = addressBook[chainId];
  let errors = 0;

  for (const [id, token] of Object.entries(tokens)) {
    const address = token.address;
    if (typeof address !== 'string' || !isAddress(address, { strict: false })) {
      console.error(`[ERROR] Invalid address for ${id} on ${chainId}: ${JSON.stringify(address)}`);
      ++errors;
    } else if (getAddress(address) !== address) {
      console.error(
        `[ERROR] Address for ${id} on ${chainId} is not checksummed: ${address} (expected ${getAddress(address)})`
      );
      ++errors;
    }
  }

  return errors;
}

function start(chains: ChainId[] = allChains) {
  const errors = chains.map(checkChain).reduce((acc, e) => acc + e, 0);
  if (errors > 0) {
    throw new Error(`Found ${errors} invalid addresses, see above`);
  }
  console.log(`All token addresses valid on ${chains.length} chains`);
}

if (process.argv.length >= 3 && process.argv[1].endsWith('checkAddresses.ts')) {
  const [, , ...chains] = process.argv;
  if (!chains.every(isChainId)) {
    throw new Error(`Invalid chainId: ${chains.filter(c => !isChainId(c)).join(', ')}`);
  }
  start(chains);
} else {
  start();
}
