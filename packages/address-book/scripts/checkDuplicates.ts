import { addressBook } from '../src/address-book';
import Token from '../src/types/token';

type ChainId = keyof typeof addressBook;
type TokenWithId = Token & { id: string };
const allChains = Object.keys(addressBook) as ChainId[];

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
    if (duplicates.length > 1 && duplicates[0].address !== tokens.WNATIVE.address) {
      console.warn(
        `[WARN] Duplicate address ${address} on ${chainId}: ${duplicates
          .map(t => `${t.id} (${t.oracleId})`)
          .join(', ')}`
      );
      const uniqueOracles = Array.from(new Set(duplicates.map(t => t.oracleId)));
      if (uniqueOracles.length > 1) {
        console.error(
          `[ERROR] Different oracleIds for ${address} on ${chainId}: ${uniqueOracles.join(', ')}`
        );
        ++errors;
      }
    }
  }

  return errors;
}

function start() {
  const errors = allChains.map(checkChain).reduce((acc, e) => acc + e, 0);
  if (errors > 0) {
    throw new Error(`Found ${errors} errors, see above`);
  }
}

start();
