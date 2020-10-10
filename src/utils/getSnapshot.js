'use strict';

const Web3 = require('web3');

const { getTopicFromSignature, getAddressFromTopic, getValueFromData } = require('./topicHelpers');

const web3 = new Web3(process.env.RPC_ENDPOINT);

const BIFI_TOKEN = process.env.BIFI_TOKEN;
const REWARD_POOL = process.env.BIFI_REWARDS;

async function getSnapshot() {
  let balances = {};
  const transferTopic = getTopicFromSignature('Transfer(address,address,uint256)');

  const logs = await web3.eth.getPastLogs({
    fromBlock: 0,
    toBlock: 'latest',
    address: BIFI_TOKEN,
    topics: [transferTopic],
  });

  logs.forEach(log => {
    const from = getAddressFromTopic(log.topics[1]);
    const to = getAddressFromTopic(log.topics[2]);
    const value = getValueFromData(log.data);

    if (from === REWARD_POOL || to === REWARD_POOL) {
      return;
    }

    if (balances[to] === undefined) {
      balances[to] = value;
    } else {
      balances[to].plus(value);
    }

    if (from !== '0x00000000000000000000000000000000') {
      balances[from].minus(value);
    }
  });

  return balances;
}

module.exports = { getSnapshot };
