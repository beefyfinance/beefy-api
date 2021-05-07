const { BigNumber, ethers } = require('ethers');
const { BSC_RPC, BSC_CHAIN_ID } = require('../constants');
const ERC20 = require('../abis/ERC20.json');
const getBlockNumber = require('../utils/getBlockNumber');
const { sleep } = require('../utils/time');

const QUERY_RANGE = 100;

const getDailyEarnings = async () => {
  const provider = new ethers.providers.JsonRpcProvider(BSC_RPC);
  const contract = new ethers.Contract(
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    ERC20,
    provider
  );
  const filterTo = contract.filters.Transfer(null, '0x453d4ba9a2d594314df88564248497f7d74d6b2c');

  let totalEarnings = BigNumber.from(0);
  let difference = 20 * 60 * 24;
  const endBlock = await getBlockNumber(BSC_CHAIN_ID);
  const startBlock = endBlock - difference;
  let currentBlock = startBlock;
  let result = BigNumber.from(0);

  try {
    while (currentBlock < endBlock) {
      // provider only allows up to 2000 blocks at a time
      let data;
      try {
        data = await contract.queryFilter(filterTo, currentBlock, currentBlock + QUERY_RANGE);
      } catch (err) {
        await sleep(30 * 1000);
        continue;
      }
      for (var i = 0; i < data.length; i++) {
        let hexAmount = data[i]['args'][2];

        let amount = BigNumber.from(hexAmount);

        totalEarnings = totalEarnings.add(amount);
      }
      currentBlock += QUERY_RANGE;
    }

    console.log('> calculated daily earnings');
    // divide twice to avoid overflow error, 1e16 so we can have 2 decimal places in response
    let result = totalEarnings.div(1e9).div(1e7);

    return {
      daily: result.toNumber() / 100,
      startBlock: startBlock,
      endBlock: endBlock,
    };
  } catch (err) {
    console.error('Daily earnings error:', err);
    return {
      daily: 0,
      startBlock: startBlock,
      endBlock: endBlock,
    };
  }
};

module.exports = { getDailyEarnings };
