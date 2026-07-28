import {
  type Address,
  createPublicClient,
  decodeAbiParameters,
  fallback,
  getAddress,
  http,
  toFunctionSelector,
} from 'viem';
import { addressBook, type Token } from '../src/address-book/index.js';

type ChainId = keyof typeof addressBook;
const allChains = Object.keys(addressBook) as ChainId[];

const rpcEnvKeyOverrides: Partial<Record<ChainId, string>> = {
  ethereum: 'ETH',
};

function getClientFor(chainId: ChainId) {
  const key = `${(rpcEnvKeyOverrides[chainId] ?? chainId).toUpperCase()}_RPC`;
  const urls = (process.env[key] ?? '')
    .split(',')
    .map(url => url.trim())
    .filter(Boolean);
  if (!urls.length) {
    throw new Error(`${key} is not set`);
  }
  return createPublicClient({ transport: fallback(urls.map(url => http(url))) });
}

function isChainId(chainId: string): chainId is ChainId {
  return !!addressBook[chainId as ChainId];
}

const selector = toFunctionSelector({
  name: 'decimals',
  type: 'function',
  inputs: [],
  outputs: [{ name: 'decimals', type: 'uint8' }],
  stateMutability: 'view',
});

function shouldSkip(chainId: ChainId, token: Token) {
  // Not sure if weird x-chain native-code token or something else but can't call .decimals on this
  if (chainId === 'moonbeam' && token.address === '0xFFfffFFecB45aFD30a637967995394Cc88C0c194') {
    return true;
  }
  return false;
}

async function checkChain(chainId: ChainId) {
  const { tokens } = addressBook[chainId];
  const allAddresses = Object.values(tokens)
    .filter(t => !shouldSkip(chainId, t))
    .map(t => getAddress(t.address));
  const publicClient = getClientFor(chainId);
  const decimalsByAddress: Record<Address, number | undefined> = Object.fromEntries(
    (
      await Promise.allSettled(
        allAddresses.map(address =>
          publicClient.call({
            to: address,
            data: selector,
          })
        )
      )
    ).map((result, i) => {
      const address = allAddresses[i];
      if (result.status === 'rejected') {
        console.error(`Failed to fetch ${address} on ${chainId} decimals`, result.reason);
        return [address, undefined];
      }
      if (!result.value || !result.value.data) {
        console.error(`Failed to fetch ${address} on ${chainId} decimals: no data returned`);
        return [address, undefined];
      }
      return [address, decodeAbiParameters([{ type: 'uint8' }], result.value.data)[0]];
    })
  );

  let mismatches = 0;
  for (const [id, token] of Object.entries(tokens)) {
    const decimals = decimalsByAddress[getAddress(token.address)];
    if (token.decimals === undefined) {
      console.error(`Decimals not set in address book for ${id} on ${chainId}`);
      ++mismatches;
    } else if (decimals === undefined) {
      console.warn(`Could not check ${token.decimals} decimals is correct for ${id} on ${chainId}`);
    } else if (token.decimals !== decimals) {
      ++mismatches;
      console.error(
        `Mismatching decimals for ${id} on ${chainId}: ${token.decimals} !== ${decimals}`
      );
    }
  }

  return mismatches;
}

async function checkChains(chains: ChainId[]) {
  const mismatchesPerChain = await Promise.allSettled(chains.map(checkChain));
  for (const result of mismatchesPerChain) {
    if (result.status === 'rejected') {
      console.error(result.reason);
    }
  }
  if (
    !mismatchesPerChain.every(
      (result): result is PromiseFulfilledResult<number> => result.status === 'fulfilled'
    )
  ) {
    throw new Error('Some chains threw errors');
  }
  const totalMismatches = mismatchesPerChain.reduce((acc, result) => acc + result.value, 0);
  if (totalMismatches > 0) {
    throw new Error(`Found ${totalMismatches} mismatches`);
  }
}

async function checkAllChains() {
  return checkChains(allChains);
}

function handleReturnCode<T>(promise: Promise<T>) {
  promise
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(-1);
    });
}

if (process.argv.length > 2) {
  const chains = process.argv.slice(2);
  const includeChains = chains.map(c => (c.startsWith('+') ? c.slice(1) : c)).filter(isChainId);
  const excludeChains = chains.map(c => (c.startsWith('-') ? c.slice(1) : '')).filter(isChainId);
  const chainsToCheck = (includeChains.length > 0 ? includeChains : allChains).filter(
    c => !excludeChains.includes(c)
  );
  if (chainsToCheck.length === 0) {
    console.error('No chains to check');
    process.exit(1);
  }
  handleReturnCode(checkChains(chainsToCheck));
} else {
  handleReturnCode(checkAllChains());
}
