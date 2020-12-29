const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const { getTopicFromSignature, getTopicFromAddress, getValueFromData } = require('./topicHelpers');

const web3 = new Web3(process.env.BSC_RPC);

const rewardPool = '0x453D4Ba9a2D594314DF88564248497F7D74d6b2C';
const wbnb = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const rewardPoolCreationBlock = '1170074';

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getPartialRewards = async (rewards, from, to) => {
	const transferTopic = getTopicFromSignature('Transfer(address,address,uint256)');
	const toTopic = getTopicFromAddress(rewardPool);

	const logs = await web3.eth.getPastLogs({
		fromBlock: from,
		toBlock: to,
		address: wbnb,
		topics: [ transferTopic, null, toTopic ]
	});

	for (let i = 0; i < logs.length; i++) {
		if (logs[i].blockNumber === rewardPoolCreationBlock && logs[i].transactionIndex < 3) {
			continue;
		}

		const value = getValueFromData(logs[i].data);
		rewards = rewards.plus(value);
	}
	return rewards;
};

const getRewardsReceived = async () => {
	let rewards = new BigNumber(0);

	const start = Number(rewardPoolCreationBlock);
	const end = await web3.eth.getBlockNumber();
	const step = 24 * 60 * 60 / 3;
	const steps = Math.trunc((end - start) / step);
	
	let from, to;
	for (let i = 0; i < steps; i++) {
		from = start + Math.trunc(step * i);
		to = from + step - 1;

		rewards = await getPartialRewards(rewards, from, to);
    await sleep(50);
	}

	rewards = await getPartialRewards(rewards, to, 'latest');

	return Number(rewards.div(1e18));
};

module.exports = { getRewardsReceived };
