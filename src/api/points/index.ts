import { getAllPointsStructures } from './getPointsStructures';

export const pointStructures = async (ctx: any) => {
  try {
    const allPointsStructures = getAllPointsStructures();
    ctx.status = 200;
    ctx.body = [...allPointsStructures];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
};
