import { addressBook } from '../address-book';
import Token from '../types/token';

type ChainId = keyof typeof addressBook;
type TokenWithId = Token & { id: string };
const allChains = Object.keys(addressBook) as ChainId[];

async function checkChain(chainId: ChainId) {
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

async function start() {
  const errors = (await Promise.all(allChains.map(checkChain))).reduce((acc, e) => acc + e, 0);
  if (errors > 0) {
    throw new Error(`Found ${errors} errors, see above`);
  }
}

start()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
