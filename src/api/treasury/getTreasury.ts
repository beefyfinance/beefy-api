import { addressBook } from '../../../packages/address-book/address-book';
import { getAllTokens } from '../tokens/getTokens';

//treasury addresses that should be queried for balances
let treasuryAddressesByChain;

//addressbook + vault tokens where balances should be queried
let tokenAddressesByChain;

const getTreasuryAddressesByChain = () => {
  const addressesByChain = {};

  Object.entries(addressBook).map(([chain, chainAddressbook]) => {
    addressesByChain[chain] = {};

    const treasuryMultisig = chainAddressbook.platforms.beefyfinance.treasuryMultisig;
    const treasury = chainAddressbook.platforms.beefyfinance.treasury;

    if (treasuryMultisig !== '0x0000000000000000000000000000000000000000') {
      addressesByChain[chain][treasuryMultisig.toLowerCase()] = {
        address: treasuryMultisig,
        label: 'treasuryMultisig',
      };
    }

    // Add treasury only if different from multisig
    if (!addressesByChain[chain][treasury.toLowerCase()]) {
      addressesByChain[chain][treasury.toLowerCase()] = {
        address: treasury,
        label: 'treasury',
      };
    }
  });

  return addressesByChain;
};

const getTokenAddressesByChain = () => {
  const addressbookTokens = getAllTokens();
  console.log(Object.keys(addressbookTokens));
  Object.keys(addressbookTokens);
};

export const initTreasuryService = async () => {
  treasuryAddressesByChain = getTreasuryAddressesByChain();
  tokenAddressesByChain = getTokenAddressesByChain();
};
