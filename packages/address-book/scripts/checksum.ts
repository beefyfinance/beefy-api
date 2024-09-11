import { addressBook } from '../src/address-book/index.js';
import { isValidChecksumAddress, toChecksumAddress } from '@ethereumjs/util';

type ChainId = keyof typeof addressBook;

type InvalidAddressBase = {
  chainId: ChainId;
  address: string | undefined;
  addressName: string;
  correctAddress: string;
};

type InvalidAddressToken = InvalidAddressBase & {
  type: 'token';
  tokenId: string;
};

type InvalidAddressPlatform = InvalidAddressBase & {
  type: 'platform';
  platformId: string;
};

type InvalidAddressInfo = InvalidAddressToken | InvalidAddressPlatform;

const allChainIds = Object.keys(addressBook) as ChainId[];

function isChainId(chainId: string): chainId is ChainId {
  return !!addressBook[chainId as ChainId];
}

function getInvalidPlatformAddressesForChain(chainId: ChainId): InvalidAddressInfo[] {
  const chain = addressBook[chainId];
  const invalidAddresses: InvalidAddressPlatform[] = [];

  for (const [platformId, addresses] of Object.entries(chain.platforms)) {
    for (const [addressName, address] of Object.entries(
      addresses as Record<string, string | undefined>
    )) {
      const isValid = address ? isValidChecksumAddress(address) : false;
      const correctAddress = address ? toChecksumAddress(address) : '';
      if (!isValid) {
        invalidAddresses.push({
          type: 'platform',
          chainId,
          platformId,
          address,
          addressName,
          correctAddress,
        });
      }
    }
  }

  return invalidAddresses;
}

function getInvalidTokenAddressesForChain(chainId: ChainId): InvalidAddressInfo[] {
  const chain = addressBook[chainId];
  const invalidAddresses: InvalidAddressToken[] = [];

  for (const [tokenId, token] of Object.entries(chain.tokens)) {
    const address = token.address;

    const isValid = isValidChecksumAddress(address);
    const correctAddress = address ? toChecksumAddress(address) : '';
    if (!isValid) {
      invalidAddresses.push({
        type: 'token',
        tokenId,
        chainId,
        addressName: 'address',
        address,
        correctAddress,
      });
    }
  }

  return invalidAddresses;
}

function getInvalidPlatformAddresses(chainIds: ChainId[]): InvalidAddressInfo[] {
  return chainIds.flatMap(chainId => getInvalidPlatformAddressesForChain(chainId));
}

function getInvalidTokenAddresses(chainIds: ChainId[]): InvalidAddressInfo[] {
  return chainIds.flatMap(chainId => getInvalidTokenAddressesForChain(chainId));
}

function getInvalidAddresses(chainIds: ChainId[]): InvalidAddressInfo[] {
  return chainIds.flatMap(chainId => [
    ...getInvalidPlatformAddressesForChain(chainId),
    ...getInvalidTokenAddressesForChain(chainId),
  ]);
}

function handleResults(invalidAddresses: InvalidAddressInfo[]) {
  let fail = false;
  if (invalidAddresses.length > 0) {
    for (const invalid of invalidAddresses) {
      const { type, chainId, address, addressName, correctAddress } = invalid;
      const targetName =
        type === 'platform' ? `platform '${invalid.platformId}'` : `token '${invalid.tokenId}'`;
      if (!invalid.address) {
        console.error(`Address '${addressName}' on ${targetName} on chain '${chainId}' is missing`);
      } else {
        console.error(
          `Address '${addressName}' on ${targetName} on chain '${chainId}' does not pass checksum. Incorrect Address: '${address}'`
        );
        console.error(`The correct address should be '${correctAddress}'`);
      }
    }
    fail = true;
  }

  if (fail) {
    process.exit(1);
  }

  console.log('All addresses pass checksum test.');
}

if (process.argv.length > 2) {
  const maybeType = process.argv[2];
  if (maybeType === '--platforms' || maybeType === '--tokens') {
    if (process.argv.length > 3) {
      const chainIds = process.argv.slice(3);
      if (!chainIds.every(isChainId)) {
        throw new Error(`Invalid chainId: ${chainIds.filter(c => !isChainId(c)).join(', ')}`);
      }
      handleResults(
        maybeType === '--platforms'
          ? getInvalidPlatformAddresses(chainIds)
          : getInvalidTokenAddresses(chainIds)
      );
    } else {
      throw new Error('Missing chainId(s)');
    }
  } else {
    const chainIds = process.argv.slice(2);
    if (!chainIds.every(isChainId)) {
      throw new Error(`Invalid chainId: ${chainIds.filter(c => !isChainId(c)).join(', ')}`);
    }
    handleResults(getInvalidAddresses(chainIds));
  }
} else {
  handleResults(getInvalidAddresses(allChainIds));
}
