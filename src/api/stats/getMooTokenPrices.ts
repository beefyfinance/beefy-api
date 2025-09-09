import { fetchPrice } from '../../utils/fetchPrice';
import { getKey, setKey } from '../../utils/cache';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { BIG_ZERO, isFiniteBigNumber } from '../../utils/big-number';
import { isFiniteNumber } from '../../utils/number';
import { getMultichainVaults } from './getMultichainVaults';

let mooTokenPrices = {};

const INIT_DELAY = Number(process.env.MOOTOKEN_INIT_DELAY || 60 * 1000);
const REFRESH_INTERVAL = 60 * 1000;
const LOG_ERRORS = process.env.MOOTOKEN_LOG_ERRORS === 'true';

export const getMooTokenPrices = () => {
  return mooTokenPrices;
};

const updateMooTokenPrices = async () => {
  const vaults = getMultichainVaults();
  const now = Date.now();
  const thirtyDaysAgo = Math.floor(now / 1000) - 30 * 24 * 60 * 60;
  let successes = 0,
    missing = 0,
    failures = 0;

  console.log('> updating mooToken prices');

  for (const vault of vaults) {
    try {
      // All vaults should have a PPFS
      if (!isFiniteBigNumber(vault.pricePerFullShare) || vault.pricePerFullShare.lte(BIG_ZERO)) {
        throw new Error(`No pricePerFullShare for vault ${vault.id}`);
      }

      // If the vault is EOL and was retired more than 30 days ago, don't output message on missing price
      const isOldEol = vault.status === 'eol' && (vault.retiredAt || now) < thirtyDaysAgo;
      const price = await fetchPrice(
        { oracle: vault.oracle, id: vault.oracleId },
        isOldEol ? false : `oracleId of ${vault.id} on ${vault.chain} in updateMooTokenPrices`
      );

      // Skip vault if price is missing
      if (!isFiniteNumber(price) || price <= 0) {
        ++missing;
        continue;
      }

      // Price per share
      const mooPrice = vault.pricePerFullShare.times(price).dividedBy(1e18);

      // Save
      if (!mooTokenPrices[vault.chain]) {
        mooTokenPrices[vault.chain] = {};
      }
      mooTokenPrices[vault.chain][vault.earnedToken] = mooPrice.toNumber();
      ++successes;
    } catch (error) {
      ++failures;
      if (LOG_ERRORS) {
        console.log(`> failed to update mooPrice of vault ${vault.id}`);
        console.log(error);
      }
    }
  }

  const level = failures > 0 ? 'error' : missing > 0 ? 'warn' : 'info';
  console[level](
    `> prices for mooTokens updated: ${successes} successes, ${missing} missing, ${failures} failures (${
      (Date.now() - now) / 1000
    }s)`
  );

  saveToRedis().catch(err => {
    console.error('> failed to save mooToken prices', err);
  });

  setTimeout(updateMooTokenPrices, REFRESH_INTERVAL);
};

export const initMooTokenPriceService = async () => {
  let cachedMooTokenPrices = await getKey('MOO_TOKEN_PRICES');
  mooTokenPrices = cachedMooTokenPrices ?? {};

  await Promise.all([
    serviceEventBus.waitForFirstEvent('vaults/updated'),
    serviceEventBus.waitForFirstEvent('prices/tokens/updated'),
    serviceEventBus.waitForFirstEvent('prices/lps/updated'),
  ]);

  setTimeout(updateMooTokenPrices, INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey('MOO_TOKEN_PRICES', mooTokenPrices);
};
