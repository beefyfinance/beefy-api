'use strict';

async function prueba(ctx, next) {
  ctx.body = {
    prueba: "OK"
  };
}

module.exports = prueba;
