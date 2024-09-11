import { addressBook } from '../src/address-book';
import Token from '../src/types/token';

type ChainId = keyof typeof addressBook;
type TokenWithId = Token & { id: string };
const allChains = Object.keys(addressBook) as ChainId[];

function isChainId(chainId: string): chainId is ChainId {
  return !!addressBook[chainId as ChainId];
}

function checkChain(chainId: ChainId) {
  const { tokens } = addressBook[chainId];
  const byAddress: Record<string, TokenWithId[]> = {};

  for (const [id, token] of Object.entries(tokens)) {
    const key = token.address.toLowerCase();
    if (!byAddress[key]) {
      byAddress[key] = [];
    }
    byAddress[key].push({
      ...token,
      id,
    });
  }

  let errors = 0;
  for (const [address, duplicates] of Object.entries(byAddress)) {
    if (duplicates.length > 1) {
      const uniqueOracles = Array.from(new Set(duplicates.map(t => t.oracleId)));
      if (uniqueOracles.length > 1) {
        // Always error if oracleIds are different for same token address
        console.error(
          `[ERROR] Different oracleIds for ${address} on ${chainId}: ${uniqueOracles.join(', ')}`
        );
        ++errors;
      } else if (duplicates[0].address !== tokens.WNATIVE.address) {
        // Only warn if same token address is used for multiple tokens and oracleIds are the same
        // (exclude WNATIVE as it is always duplicated)
        console.warn(
          `[WARN] Duplicate address ${address} on ${chainId}: ${duplicates
            .map(t => `${t.id} (${t.oracleId})`)
            .join(', ')}`
        );
      }
    }
  }

  return errors;
}

function start(chains: ChainId[] = allChains) {
  const errors = chains.map(checkChain).reduce((acc, e) => acc + e, 0);
  if (errors > 0) {
    throw new Error(`Found ${errors} errors, see above`);
  }
}

if (process.argv.length >= 3 && process.argv[1].endsWith('checkDuplicates.ts')) {
  const [, , ...chains] = process.argv;
  if (!chains.every(isChainId)) {
    throw new Error(`Invalid chainId: ${chains.filter(c => !isChainId(c)).join(', ')}`);
  }
  start(chains);
} else {
  start();
}
