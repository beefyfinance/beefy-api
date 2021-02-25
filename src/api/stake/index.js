'use strict';

const getStakePoolsData = require('./getStakePoolsData');

const TIMEOUT = 5 * 60 * 1000;

async function data(ctx) {
  try {
    ctx.request.socket.setTimeout(TIMEOUT);
    let stakePools = await getStakePoolsData();

    if (Object.keys(stakePools).length === 0) {
      throw 'There is no stake pools data yet'
    }

    ctx.status = 200;
    ctx.body = stakePools;
  } catch (err) {
    ctx.throw(500, err);
  }
}

module.exports = { data };
