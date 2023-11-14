import { addressBook } from '../address-book';

type ChainId = keyof typeof addressBook;
const allChains = Object.keys(addressBook) as ChainId[];

async function checkChain(chainId: ChainId) {
  const { tokens } = addressBook[chainId];

  for (const [id, token] of Object.entries(tokens)) {
    if (!token.oracleId) {
      console.error(`Missing oracleId for ${id} on ${chainId}`);
    }
  }
}

async function start() {
  await Promise.all(allChains.map(checkChain));
}

start()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
