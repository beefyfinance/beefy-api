import { getAllNewBoosts, getAllOldBoosts, getChainNewBoosts, getChainOldBoosts } from './getBoosts';

export const boosts = async (ctx: any) => {
  try {
    const allBoosts = getAllOldBoosts();
    ctx.status = 200;
    ctx.body = [...allBoosts];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
};

export const chainBoosts = async (ctx: any) => {
  try {
    const chainBoosts = getChainOldBoosts(ctx.params.chainId);
    ctx.status = 200;
    ctx.body = [...chainBoosts];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
};

export const boostsV2 = async (ctx: any) => {
  try {
    const allBoosts = getAllNewBoosts();
    ctx.status = 200;
    ctx.body = [...allBoosts];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
};

export const chainBoostsV2 = async (ctx: any) => {
  try {
    const chainBoosts = getChainNewBoosts(ctx.params.chainId);
    ctx.status = 200;
    ctx.body = [...chainBoosts];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
};
