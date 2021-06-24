import { addressBook } from '../address-book';
import { isValidChecksumAddress, toChecksumAddress } from 'ethereumjs-util';
import { exit } from 'process';
import chainIdMap from '../util/chainIdMap';

interface InvalidAddressInfo {
  chainName: string;
  platformName?: string;
  address: string;
  addressName: string;
  correctAddress: string;
}

export const validateAllAddressesChecksum = (): InvalidAddressInfo[][] => {
  const invalidPlatformAddressList: InvalidAddressInfo[] = [];
  const invalidTokenAddressList: InvalidAddressInfo[] = [];

  const chains = Object.entries(addressBook);
  for (const chain of chains) {
    const chainName = chain[0] as keyof typeof chainIdMap;
    const chainId = chainIdMap[chainName];
    const { platforms, tokens } = chain[1];
    const platformEntries = Object.entries(platforms);

    // validate platforms
    for (const platform of platformEntries) {
      const platformName = platform[0];
      const addresses = platform[1];

      for (const addressEntry of Object.entries(addresses)) {
        const addressName = addressEntry[0];
        const address = addressEntry[1] as string;

        const isValid = isValidChecksumAddress(address);
        const correctAddress = address ? toChecksumAddress(address) : '';
        if (!isValid) {
          invalidPlatformAddressList.push({
            chainName,
            platformName,
            address,
            addressName,
            correctAddress,
          });
        }
      }
    }

    const tokenInfoEntries = Object.entries(tokens);
    // validate token addresses
    for (const tokenInfoEntry of tokenInfoEntries) {
      const tokenName = tokenInfoEntry[0];
      const tokenInfo = tokenInfoEntry[1];
      const address = tokenInfo.address;

      const isValid = isValidChecksumAddress(address);
      const correctAddress = address ? toChecksumAddress(address) : '';
      if (!isValid) {
        invalidTokenAddressList.push({
          chainName,
          addressName: tokenName,
          address,
          correctAddress,
        });
      }
    }
  }

  return [invalidPlatformAddressList, invalidTokenAddressList];
};

const [invalidPlatformAddressList, invalidTokenAddressList] = validateAllAddressesChecksum();
let fail = false;
if (invalidPlatformAddressList.length > 0) {
  for (const invalid of invalidPlatformAddressList) {
    const { chainName, platformName, address, addressName, correctAddress } = invalid;
    if (!invalid.address) {
      // (it's a placeholder)
      console.log(
        `Address '${addressName}' on platform '${platformName}' on chain '${chainName}' is missing`
      );
    } else {
      console.log(
        `Address '${addressName}' on platform '${platformName}' on chain '${chainName}' does not pass checksum. Incorrect Address: '${address}'`
      );
      console.log(`The correct address should be '${correctAddress}'`);
    }
  }
  fail = true;
}

if (invalidTokenAddressList.length > 0) {
  for (const invalid of invalidTokenAddressList) {
    const { chainName, address, addressName, correctAddress } = invalid;
    if (!invalid.address) {
      // (it's a placeholder)
      console.log(`Token address '${addressName}' on chain '${chainName}' is missing`);
    } else {
      console.log(
        `Token address '${addressName}' on chain '${chainName}' does not pass checksum. Incorrect Address: '${address}'`
      );
      console.log(`The correct address should be '${correctAddress}'`);
    }
  }
  fail = true;
}

if (fail) {
  exit(1);
}

console.log('All addresses pass checksum test');
