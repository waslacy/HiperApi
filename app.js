const bodyParser = require("body-parser");
const cors = require("cors");
const Pedidos = require('./modules/pedidos')
const Produtos = require('./modules/produtos')
const db = require('./modules/db');

async function runApp() {
  setInterval(async () => {
    let clientes = await db.selectCustomers()

    for (let i = 0; i < clientes.length; i++) {
      if (clientes[i].ativo != 1) {
        continue;
      }

      Pedidos(
        clientes[i].url_site,
        clientes[i].c_key,
        clientes[i].c_secret,
        clientes[i].c_hiper,
        clientes[i].id
      )

      Produtos(
        clientes[i].url_site,
        clientes[i].c_key,
        clientes[i].c_secret,
        clientes[i].c_hiper,
        clientes[i].id
      )
    }

  }, 180000)
}

runApp()