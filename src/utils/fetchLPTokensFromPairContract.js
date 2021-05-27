const { ethers } = require('ethers');
const { MULTICHAIN_RPC } = require('../constants');
const LPPair = require('../abis/LPPair.json');
const { addressBook } = require('blockchain-addressbook');

const fetchLPTokensFromPairContract = async pool => {
  const { chainId } = pool;
  if (!chainId) {
    // skip for legacy pools
    return;
  }
  // Setup multichain
  const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chainId]);
  const lpContract = new ethers.Contract(pool.address, LPPair, provider);
  const token0Address = await lpContract.token0();
  const token1Address = await lpContract.token1();

  // lookup in addressbook
  if (chainId in chainIdToAddressBookMap) {
    const chainAddressBook = chainIdToAddressBookMap[chainId];
    const { tokenAddressMap } = chainAddressBook;

    const setTokenData = (tokenAddress, idx) => {
      // lookup in tokenAddressMap
      // caution, may need to checksum this address if the address we get from the pair contract is not checksummed
      if (tokenAddress in tokenAddressMap) {
        const token = tokenAddressMap[tokenAddress];
        // Add to pool data, or mutate existing data
        const existingData = pool['lp' + idx];
        let newData = existingData ? existingData : {};
        newData.address = token.address;
        newData.oracleId = token.symbol;
        newData.decimals = '1e' + token.decimals.toString();
      } else {
        console.log('token address missing: ' + tokenAddress.toString());
      }
    };

    // update token0 and token1 info
    [token0Address, token1Address].forEach((address, idx) => setTokenData(address, idx));
  } else {
    console.log('ChainIdMissing: ' + chainId.toString());
  }
};

const chainIdToAddressBookMap = {
  56: addressBook.bsc,
  // 128: undefined,
  137: addressBook.polygon,
  43114: addressBook.avax,
  250: addressBook.fantom,
};

module.exports = fetchLPTokensFromPairContract;
