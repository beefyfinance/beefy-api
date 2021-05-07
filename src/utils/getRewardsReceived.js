const { bscWeb3: web3 } = require('./web3');
const BigNumber = require('bignumber.js');
const { sleep } = require('./time');
const { BSC_CHAIN_ID } = require('../constants');
const getBlockNumber = require('./getBlockNumber');

const { getTopicFromSignature, getTopicFromAddress, getValueFromData } = require('./topicHelpers');

const RPC_QUERY_LIMIT = 1000;
const RPC_QUERY_INTERVAL = 50;
const RPC_QUERY_RETRY = 30 * 1000;
const FIRST_REWARD_BLOCK = 1457038;

// pre-calculated rewards for specific block to get them fetched faster
// can be updated with the values from the "getRewardsReceived" log below
const CACHED_REWARDS = '15396145210483744068378';
const CACHED_REWARD_BLOCK = 6954416;

const REWARD_POOL = '0x453D4Ba9a2D594314DF88564248497F7D74d6b2C';
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

const getRewardsReceived = async () => {
  let result = new BigNumber(CACHED_REWARDS);

  const transferTopic = getTopicFromSignature('Transfer(address,address,uint256)');
  const toTopic = getTopicFromAddress(REWARD_POOL);

  const lastBlock = await getBlockNumber(BSC_CHAIN_ID);
  let fromBlock = CACHED_REWARD_BLOCK;

  while (fromBlock < lastBlock) {
    let toBlock = fromBlock + RPC_QUERY_LIMIT;
    if (toBlock > lastBlock) {
      toBlock = lastBlock;
    }

    try {
      const logs = await web3.eth.getPastLogs({
        fromBlock: fromBlock,
        toBlock: toBlock - 1,
        address: WBNB,
        topics: [transferTopic, null, toTopic],
      });

      for (let i = 0; i < logs.length; i++) {
        const value = getValueFromData(logs[i].data);
        result = result.plus(value);
      }
    } catch (err) {
      await sleep(RPC_QUERY_RETRY);
      continue;
    }

    await sleep(RPC_QUERY_INTERVAL);
    fromBlock = toBlock;
  }

  console.log('> getRewardsReceived', lastBlock, result.toFixed());

  return Number(result.dividedBy('1e18'));
};

module.exports = { getRewardsReceived };
