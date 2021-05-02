const { ethers } = require('ethers');

//const ERC20 = require('../abis/ERC20.json');
const MulticallAbi = require('../abis/BeefyPriceMulticall.json');

const MULTICALLS = {
  56: "0x0943afe23cb43BD15aC2d58bACa34Eb570BFC278"
  // TODO: multichain addresses
}

const RPC = {
  56: 'https://bsc-dataseed.binance.org',
  // TODO: multichain rpc
}

// Dead code
// const fetchPoolTokenBalance = async (lpAddress, tokenAddress, chainId = BSC_CHAIN_ID) => {
//   const web3 = web3Factory(chainId);

//   if (web3.utils.isAddress(lpAddress) === false) {
//     throw new Error(`Invalid pool address: '${lpAddress}'`);
//   }
//   if (web3.utils.isAddress(tokenAddress) === false) {
//     throw new Error(`Invalid token address: '${tokenAddress}'`);
//   }

//   let tokenBalance = 0;
//   if (tokenAddress === nativeToken) {
//     tokenBalance = new BigNumber(await web3.eth.getBalance(lpAddress));
//   } else {
//     const tokenContract = new web3.eth.Contract(ERC20, tokenAddress);
//     tokenBalance = new BigNumber(await tokenContract.methods.balanceOf(lpAddress).call());
//   }

//   return tokenBalance;
// };

// const fetchPoolTokenSupply = async (tokenAddress, chainId = BSC_CHAIN_ID) => {
//   const web3 = web3Factory(chainId);

//   const tokenContract = new web3.eth.Contract(ERC20, tokenAddress);
//   const tokenSupply = new BigNumber(await tokenContract.methods.totalSupply().call());

//   return tokenSupply;
// };

// const fetchPoolPrices = async (
//   lp,
//   unknownToken,
//   knownToken,
//   knownTokenPricePerUnit,
//   chainId = BSC_CHAIN_ID,
// ) => {
//   const knownTokenBalance = await fetchPoolTokenBalance(lp.address, knownToken.address, chainId);
//   const knownTokenValuation = knownTokenBalance.div(knownToken.decimals).times(knownTokenPricePerUnit);

//   const unknownTokenBalance = await fetchPoolTokenBalance(lp.address, unknownToken.address, chainId);
//   const unknownTokenValuation = knownTokenValuation;
//   const unknownTokenPriceUnit = unknownTokenValuation.div(unknownTokenBalance.div(unknownToken.decimals));

//   const lpTokenSupply = await fetchPoolTokenSupply(lp.address, chainId);
//   const lpTokenValuation = knownTokenValuation.times(2);
//   const lpTokenPricePerUnit = lpTokenValuation.div(lpTokenSupply.div(lp.decimals));

//   return {
//     lpTokenPrice: lpTokenPricePerUnit.toNumber(),
//     unknownTokenValuation: unknownTokenValuation.toNumber(),
//     unknownTokenPrice: unknownTokenPriceUnit.toNumber(),
//     knownTokenPrice: knownTokenPricePerUnit,
//   };
// };

const fetchAmmPrices = async (pools, knownPrices) => {
  let poolPrices = {};
  let tokenPrices = { ...knownPrices };

  for (let chain in MULTICALLS) {
    let filtered = pools.filter(p => p.chainId === chain);
    
    // Old BSC pools don't have the chainId attr
    if (chain === "56"){
      filtered = filtered.concat(pools.filter(p => p.chainId === undefined));
    }

    // Setup multichain 
    const provider = new ethers.providers.JsonRpcProvider(RPC[chain]);
    const multicall = new ethers.Contract(MULTICALLS[chain], MulticallAbi, provider);
    
    // TODO: split query in batches?
    const query = filtered.map(p => [p.address, p.lp0.address, p.lp1.address]);
    const buf = await multicall.getLpInfo(query);
    
    // Merge fetched data
    for (let i = 0; i < filtered.length; i++) {
      filtered[i].totalSupply = buf[i * 3 + 0];
      filtered[i].lp0.balance = buf[i * 3 + 1];
      filtered[i].lp1.balance = buf[i * 3 + 2];
    }

    const unsolved = filtered.slice();
    let solving = true;
    while (solving){
      console.log('------------- price solving iteration -------------');
      solving = false;
    }

    console.log('unsolved:', unsolved.length);

    // console.log(filtered);
  }
  
  // if chain
  process.exit();

  return {
    poolPrices: poolPrices,
    tokenPrices: tokenPrices,
  };
};

module.exports = { fetchAmmPrices };
