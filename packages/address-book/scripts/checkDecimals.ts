import { addressBook, ChainId as ChainIdEnum, type Token } from '../src/address-book';
import { getRPCClient } from '../../../src/api/rpc/client';
import { Address, decodeAbiParameters, getAddress, getFunctionSelector } from 'viem';

type ChainId = keyof typeof addressBook;
const allChains = Object.keys(addressBook) as ChainId[];

const selector = getFunctionSelector({
  name: 'decimals',
  type: 'function',
  inputs: [],
  outputs: [{ name: 'decimals', type: 'uint8' }],
  stateMutability: 'view',
});

function shouldSkip(chainId: ChainId, token: Token) {
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
  const publicClient = getRPCClient(ChainIdEnum[chainId]);
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
    } else if (token.decimals !== decimals) {
      ++mismatches;
      console.error(
        `Mismatching decimals for ${id} on ${chainId}: ${token.decimals} !== ${decimals}`
      );
    }
  }

  return mismatches;
}

async function start() {
  const mismatchesPerChain = await Promise.allSettled(allChains.map(checkChain));
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

start()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
