const axios = require("axios");
const woocommerceAPI = require("@woocommerce/woocommerce-rest-api").default;
const fs = require("fs");
const tokenHiper = require('./token')
const db = require('./db')
/* imports */

class PedidosDeVenda {
    constructor(wooUrl, cKey, cSecret, tokenHiper, clienteId) { // construtor
        this.token = tokenHiper;
        this.woocommerce = new woocommerceAPI({
            url: wooUrl,
            consumerKey: cKey,
            consumerSecret: cSecret,
            version: "wc/v3",
        });
        this.pedidosWooCommerce;
        this.pedido;
        this.pedidoHiper;
        this.pedidosHiper = [];
        this.envioPedido;
        this.clienteId = clienteId;
    }

    async listarPedidos() { // lista pedidos do woocommerce baseado na data
        let data = await db.getData(this.clienteId)

        this.pedidosWooCommerce = await this.woocommerce // pega os pedidos do woocommerce
            .get(`orders`)
            .then((response) => {
                return response.data;
            });

        data = new Date(Date.now());
        data.setHours(data.getHours() - 3)
        data = data.toISOString()
        data = data.replace('T', '%20')
        data = data.replace('Z', '') // pega a data atual e formata

        db.setData(this.clienteId, data)

        return this.pedidosWooCommerce;
    }

    async getIBGE(postcode) { // pega o codigo ibge do endereço
        this.codIBGE = await axios({
            url: `https://viacep.com.br/ws/${postcode}/json/`,
            method: "get"
        }).then((response) => {
            return response.data.ibge
        })
        return this.codIBGE
    }

    async getProductId(wooID, varId) { // pega o id hiper dos produtos
        if(varId){
            try {
                this.produtoWooId = await this.woocommerce
                .get(`products/${wooID}/variations/${varId}`)
                .then((response) => {
                    let VariacaoId = response.data.sku.split('/')
                    return VariacaoId[0];
                });
            } catch(e){
                return '00000000-0000-0000-0000-000000000000'
            }
        } else {
            try {
                this.produtoWooId = await this.woocommerce
                .get(`products/${wooID}`)
                .then((response) => {
                    return response.data.attributes[0].options[0];
                });
            } catch(e){
                return '00000000-0000-0000-0000-000000000000'
            }
        }

        return this.produtoWooId;
    }

    async gerarListaPedidosHiper() { // gera a lista com os pedidos
        this.pedidosWooCommerce = await this.listarPedidos();

        for (let i = 0; i < this.pedidosWooCommerce.length; i++) {
            this.pedido = this.pedidosWooCommerce.slice(i, i + 1);
            this.pedido = this.pedido[0]; // pedido único do woocommerce
            this.items = [];
            this.pedido.billing.postcode = this.pedido.billing.postcode.replace(/[^0-9]/g, ''); // regex no cep

            if(this.pedido.customer_note.substr(0, 1) == '*'){
                continue;
            }

            for (let c = 0; c < this.pedido.line_items.length; c++) { //gera o objeto dos items
                this.items.push({
                    "produtoId": await this.getProductId(this.pedido.line_items[c].product_id, this.pedido.line_items[c].variation_id),
                    "quantidade": this.pedido.line_items[c].quantity,
                    "precoUnitarioBruto": this.pedido.line_items[c].total,
                    "precoUnitarioLiquido": this.pedido.line_items[c].total
                })
            }

            if (this.pedido.shipping.address_1 == '') { // verifica se o endereço de shipping está vazio e preenche com os dados do billing
                this.pedido.shipping.neighborhood = this.pedido.billing.neighborhood
                this.pedido.shipping.postcode = this.pedido.billing.postcode
                this.pedido.shipping.postcode = this.pedido.billing.postcode
                this.pedido.shipping.address_2 = this.pedido.billing.address_2
                this.pedido.shipping.address_1 = this.pedido.billing.address_1
                this.pedido.shipping.number = this.pedido.billing.number
            }

            this.pedidoHiper = { // monta o pedido hiper
                "cliente": {
                    "documento": this.pedido.billing.cpf,
                    "email": this.pedido.billing.email,
                    "inscricaoEstadual": this.pedido.billing.ie,
                    "nomeDoCliente": this.pedido.billing.first_name + ' ' + this.pedido.billing.last_name,
                    "nomeFantasia": this.pedido.billing.company
                },
                "enderecoDeCobranca": {
                    "bairro": this.pedido.billing.neighborhood,
                    "cep": this.pedido.billing.postcode,
                    "codigoIbge": await this.getIBGE(this.pedido.billing.postcode),
                    "complemento": this.pedido.billing.address_2,
                    "logradouro": this.pedido.billing.address_1,
                    "numero": this.pedido.billing.number
                },
                "enderecoDeEntrega": {
                    "bairro": this.pedido.shipping.neighborhood,
                    "cep": this.pedido.shipping.postcode,
                    "codigoIbge": await this.getIBGE(this.pedido.shipping.postcode),
                    "complemento": this.pedido.shipping.address_2,
                    "logradouro": this.pedido.shipping.address_1,
                    "numero": this.pedido.shipping.number
                },
                "itens": this.items,
                "meiosDePagamento": [
                    {
                        "idMeioDePagamento": (this.pedido.payment_method == 'asaas-credit-card') ? 4 : 12,
                        "parcelas": 1,
                        "valor": this.pedido.total
                    }
                ],
                "numeroPedidoDeVenda": this.pedido.id.toString(),
                "observacaoDoPedidoDeVenda": this.pedido.costumer_note,
                "valorDoFrete": this.pedido.shipping_total
            };
            this.pedidosHiper.push(this.pedidoHiper)
        }

        return this.pedidosHiper
    }

    async saveWooPedido(idWoo, idHiper){
        let dat = {
            customer_note: `*${idHiper}`
        }

        this.pedidosWooCommerce = await this.woocommerce // pega os pedidos do woocommerce
            .put(`orders/${idWoo}`, dat)
            .then((response) => {
                return response.data;
            });
    }

    async enviarPedidos() { // envia os pedidos para o hiper
        this.token = await this.token; // token da hiper
        this.pedidosHiper = await this.gerarListaPedidosHiper();

        this.pedidosHiper.forEach(async (el) => { // envia cada item do array separado
            try {
                this.envioPedido = await axios({
                    url: `http://ms-ecommerce.hiper.com.br/api/v1/pedido-de-venda/`,
                    method: "post",
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                    data: el,
                }).then((response) => {
                    this.saveWooPedido(el.numeroPedidoDeVenda, response.data.id)
                    return response
                });

                return this.envioPedido
            } catch (e) {
                console.log(e.response.data)
            }
        });

        return 'Pedidos enviados com sucesso'
    }
}

function pedidos(wcUrl, cKey, cSecret, chave, clienteId) { // construtor
    let pedidos = new PedidosDeVenda(
        wcUrl,
        cKey,
        cSecret,
        tokenHiper(chave),
        clienteId
    );

    let resp = pedidos.enviarPedidos().then((response) => {
        return response
    });

    return resp
}

module.exports = pedidos