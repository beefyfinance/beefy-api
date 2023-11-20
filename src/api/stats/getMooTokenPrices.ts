import { fetchPrice } from '../../utils/fetchPrice';
import { getKey, setKey } from '../../utils/cache';

const { getMultichainVaults } = require('../stats/getMultichainVaults');

let mooTokenPrices = {};

const INIT_DELAY = Number(process.env.MOOTOKEN_INIT_DELAY || 60 * 1000);
const REFRESH_INTERVAL = 60 * 1000;

export const getMooTokenPrices = () => {
  return mooTokenPrices;
};

const updateMooTokenPrices = async () => {
  let vaults = getMultichainVaults();
  for (const vault of vaults) {
    try {
      let price = await fetchPrice(
        { oracle: vault.oracle, id: vault.oracleId },
        `oracleId of ${vault.id} on ${vault.chain} in updateMooTokenPrices`
      );
      const mooPrice = vault.pricePerFullShare.times(price).dividedBy(1e18);

      if (mooPrice) {
        if (!mooTokenPrices[vault.chain]) mooTokenPrices[vault.chain] = {};
        mooTokenPrices[vault.chain][vault.earnedToken] = mooPrice.toNumber();
      }
    } catch (error) {
      console.log(`> failed to update mooPrice of vault ${vault.id}`);
      console.log(error);
    }
  }

  saveToRedis();
  setTimeout(updateMooTokenPrices, REFRESH_INTERVAL);
};

export const initMooTokenPriceService = async () => {
  let cachedMooTokenPrices = await getKey('MOO_TOKEN_PRICES');
  mooTokenPrices = cachedMooTokenPrices ?? {};
  setTimeout(updateMooTokenPrices, INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey('MOO_TOKEN_PRICES', mooTokenPrices);
};
