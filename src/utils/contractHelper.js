const Contract = require('web3-eth-contract');

//Use when contract will be used with multicall
export const getContract = (abi, address) => {
  let contract = new Contract(abi, address);
  return contract;
};

export const getContractWithProvider = (abi, address, provider) => {
  let contract = new Contract(abi, address);
  contract.setProvider(provider);
  return contract;
};
