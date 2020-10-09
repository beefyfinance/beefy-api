const Web3 = require("web3");

const { getTopicFromSignature, getAddressFromTopic, getValueFromData } = require("./topicHelpers");

const web3 = new Web3("https://bsc-dataseed1.defibit.io/");

const bifiToken = "0xCa3F508B8e4Dd382eE878A314789373D80A5190A";
const rewardPool = "0x453D4Ba9a2D594314DF88564248497F7D74d6b2C";

const getSnapshot = async () => {
  let balances = {};
  const transferTopic = getTopicFromSignature("Transfer(address,address,uint256)");

  const logs = await web3.eth.getPastLogs({
    fromBlock: 0,
    toBlock: "latest",
    address: bifiToken,
    topics: [transferTopic]
  });

  logs.forEach(log => {
    const from = getAddressFromTopic(log.topics[1]);
    const to = getAddressFromTopic(log.topics[2]);
    const value = getValueFromData(log.data);

    if (from === rewardPool || to === rewardPool) return;

    if (balances[to] === undefined) {
      balances[to] = value;
    } else {
      balances[to].plus(value);
    }

    if (from !== "0x00000000000000000000000000000000") {
      balances[from].minus(value);
    }
  });

  return balances;
};

module.exports = getSnapshot;
