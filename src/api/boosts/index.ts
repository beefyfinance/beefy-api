import { getAllBosts, getChainBoosts } from './getBoosts';

export const boosts = async (ctx: any) => {
  try {
    const allBoosts = getAllBosts();
    ctx.status = 200;
    ctx.body = [...allBoosts];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
};

export const chainBoosts = async (ctx: any) => {
  try {
    const chainBoosts = getChainBoosts(ctx.params.chainId);
    ctx.status = 200;
    ctx.body = [...chainBoosts];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
};
