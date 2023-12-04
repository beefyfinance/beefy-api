import { addressBook } from '../address-book';

type ChainId = keyof typeof addressBook;
const allChains = Object.keys(addressBook) as ChainId[];

const skipPrices = true;

type Vault = {
  id: string;
  tokenAddress: string;
  oracleId: string;
  chain: ChainId;
};

async function fetchVaults(): Promise<Record<ChainId, Vault[]>> {
  const response = await fetch('https://api.beefy.finance/vaults');
  const vaults = (await response.json()) as Vault[];

  return vaults.reduce((acc, vault) => {
    if (!acc[vault.chain]) {
      acc[vault.chain] = [];
    }
    acc[vault.chain].push(vault);
    return acc;
  }, {} as Record<ChainId, Vault[]>);
}

async function fetchPrices(): Promise<Record<string, number>> {
  const requests = [
    fetch('https://api.beefy.finance/prices'),
    fetch('https://api.beefy.finance/lps'),
  ];
  const responses = await Promise.all(requests);
  const data: Record<string, unknown>[] = await Promise.all(
    responses.map(async r => (await r.json()) as Record<string, unknown>)
  );
  const joined = Object.assign({}, ...data);
  return Object.entries(joined).reduce((acc, [key, value]) => {
    if (typeof value === 'number' && isFinite(value) && !isNaN(value)) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, number>);
}

async function checkChain(chainId: ChainId, vaults: Vault[], prices: Record<string, number>) {
  let errors = 0;
  const { tokens } = addressBook[chainId];
  for (const [id, token] of Object.entries(tokens)) {
    if (!token.oracleId) {
      ++errors;
      console.error(`Missing oracleId for ${id} on ${chainId}`);
    }

    const vaultsWithToken = vaults.filter(
      vault =>
        vault.tokenAddress && vault.tokenAddress.toLowerCase() === token.address.toLowerCase()
    );
    for (const vault of vaultsWithToken) {
      if (vault.oracleId !== token.oracleId) {
        ++errors;
        console.error(
          `Mismatched oracleId for ${id} on ${chainId}: ${vault.oracleId} from vault ${vault.id} vs ${token.oracleId} from addressbook`
        );
      }
    }

    if (!skipPrices) {
      if (token.oracleId && !(token.oracleId in prices)) {
        ++errors;
        console.error(`Missing price for ${id} on ${chainId} via oracle ${token.oracleId}`);
      }
    }
  }

  return errors;
}

async function start() {
  const [vaults, prices] = await Promise.all([fetchVaults(), fetchPrices()]);
  const errors = (
    await Promise.all(allChains.map(chain => checkChain(chain, vaults[chain], prices)))
  ).reduce((acc, e) => acc + e, 0);
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
