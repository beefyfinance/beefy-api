const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const BeltLP = require('../../../../abis/BeltLP.json');
const BeltMultiStrategyToken = require('../../../../abis/BeltMultiStrategyToken.json');

const DECIMALS = '1e18';

const getBeltPrices = async tokenPrices => {
  const getPrices = [getBeltVenusLpPrice, getBelt4BeltLpPrice];
  const beltTokens = [
    { name: 'belt-beltbnb', address: '0xa8Bb71facdd46445644C277F9499Dd22f6F0A30C', token: 'WBNB' },
    { name: 'belt-beltbtc', address: '0x51bd63F240fB13870550423D208452cA87c44444', token: 'BTCB' },
    { name: 'belt-belteth', address: '0xAA20E8Cb61299df2357561C2AC2e1172bC68bc25', token: 'ETH' },
  ];

  let prices = {};
  let promises = [];
  getPrices.forEach(getPrice => promises.push(getPrice()));
  beltTokens.forEach(beltToken => promises.push(getBeltTokenPrice(beltToken, tokenPrices)));
  const values = await Promise.all(promises);

  for (let item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getBeltVenusLpPrice = async () => {
  const beltLPContract = new web3.eth.Contract(
    BeltLP,
    '0xF16D312d119c13dD27fD0dC814b0bCdcaAa62dfD'
  );
  let tokenPrice = new BigNumber(await beltLPContract.methods.get_virtual_price().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'belt-venus-blp': tokenPrice };
};

const getBelt4BeltLpPrice = async () => {
  const beltLPContract = new web3.eth.Contract(
    BeltLP,
    '0xAEA4f7dcd172997947809CE6F12018a6D5c1E8b6'
  );
  let tokenPrice = new BigNumber(await beltLPContract.methods.get_virtual_price().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'belt-4belt': tokenPrice };
};

const getBeltTokenPrice = async (beltToken, tokenPrices) => {
  const beltContract = new web3.eth.Contract(BeltMultiStrategyToken, beltToken.address);
  let sharePrice = new BigNumber(await beltContract.methods.getPricePerFullShare().call());

  let tokenPrice;
  const tokenSymbol = beltToken.token;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }

  const price = Number(sharePrice.dividedBy(DECIMALS).times(tokenPrice).toFixed(6));
  return { [beltToken.name]: price };
};

module.exports = getBeltPrices;
