const BigNumber = require('bignumber.js');
const { default: BeltLPAbi } = require('../../../../abis/BeltLP');
const { BSC_CHAIN_ID } = require('../../../../constants');
const { default: BeltMultiStrategyTokenAbi } = require('../../../../abis/BeltMultiStrategyToken');
const { fetchContract } = require('../../../rpc/client');

const DECIMALS = '1e18';
const getBeltPrices = async tokenPrices => {
  const beltTokens = [
    { name: 'belt-beltbnb', address: '0xa8Bb71facdd46445644C277F9499Dd22f6F0A30C', token: 'WBNB' },
    { name: 'belt-beltbtc', address: '0x51bd63F240fB13870550423D208452cA87c44444', token: 'BTCB' },
    { name: 'belt-belteth', address: '0xAA20E8Cb61299df2357561C2AC2e1172bC68bc25', token: 'ETH' },
  ];

  const results = await Promise.allSettled([
    getBeltVenusLpPrice(),
    getBelt4BeltLpPrice(),
    ...beltTokens.map(beltToken => getBeltTokenPrice(beltToken, tokenPrices)),
  ]);

  const prices = [];
  for (const i in results) {
    const result = results[i];
    if (result.status === 'rejected') {
      console.error('getBeltPrices rejected', i, result.reason);
    } else {
      prices.push(result.value);
    }
  }

  return Object.assign({}, ...prices);
};

const getBeltVenusLpPrice = async () => {
  const beltLPContract = fetchContract(
    '0xF16D312d119c13dD27fD0dC814b0bCdcaAa62dfD',
    BeltLPAbi,
    BSC_CHAIN_ID
  );
  let tokenPrice = new BigNumber(await beltLPContract.read.get_virtual_price());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'belt-venus-blp': tokenPrice };
};

const getBelt4BeltLpPrice = async () => {
  const beltLPContract = fetchContract(
    '0xAEA4f7dcd172997947809CE6F12018a6D5c1E8b6',
    BeltLPAbi,
    BSC_CHAIN_ID
  );
  let tokenPrice = new BigNumber(await beltLPContract.read.get_virtual_price());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'belt-4belt': tokenPrice };
};

const getBeltTokenPrice = async (beltToken, tokenPrices) => {
  const beltContract = fetchContract(beltToken.address, BeltMultiStrategyTokenAbi, BSC_CHAIN_ID);
  let sharePrice = new BigNumber(await beltContract.read.getPricePerFullShare());

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
