import { addressBook, ChainId as ChainIdEnum } from '../address-book';
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

async function checkChain(chainId: ChainId) {
  const { tokens } = addressBook[chainId];
  const allAddresses = Object.values(tokens).map(t => getAddress(t.address));
  const publicClient = getRPCClient(ChainIdEnum[chainId]);
  const decimalsByAddress: Record<Address, number> = Object.fromEntries(
    (
      await Promise.all(
        allAddresses.map(address =>
          publicClient.call({
            to: address,
            data: selector,
          })
        )
      )
    ).map((result, i) => {
      if (result && result.data) {
        return [allAddresses[i], decodeAbiParameters([{ type: 'uint8' }], result.data)[0]];
      }
      console.debug(result);
      throw new Error(`Failed to fetch decimals for ${allAddresses[i]} on ${chainId}`);
    })
  );

  for (const [id, token] of Object.entries(tokens)) {
    const decimals = decimalsByAddress[getAddress(token.address)];
    if (token.decimals !== decimals) {
      console.error(
        `Mismatching decimals for ${id} on ${chainId}: ${token.decimals} !== ${decimals}`
      );
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
