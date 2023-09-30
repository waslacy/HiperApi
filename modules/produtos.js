const axios = require("axios")
const woocommerceAPI = require("@woocommerce/woocommerce-rest-api").default
const tokenHiper = require('./token')
const db = require('./db')
const fs = require('fs');
const path = require('path');

class ProdutosHiper {
    constructor(tokenHiper, clienteId, pontoDeSincronizacao){
        this.token = tokenHiper
        this.clienteId = clienteId
        this.produtosHiper
        this.variacoes = []
        this.pontoDeSincronizacao = pontoDeSincronizacao
    }
    
    setPontoSincronizacao(){
        db.setPonto(this.clienteId, this.pontoDeSincronizacao)
    }

    async listarProdutos(){
        try{
            this.produtosHiper = await axios({
                url: `http://ms-ecommerce.hiper.com.br/api/v1/produtos/pontoDeSincronizacao?pontoDeSincronizacao=${this.pontoDeSincronizacao}`,
                method: "get",
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }).then((r) => {
                this.pontoDeSincronizacao = r.data.pontoDeSincronizacao
                return r.data.produtos
            })
        } catch(e) {
            return []
        }

        this.setPontoSincronizacao()
    }

    getProdutos(){
        return this.produtosHiper
    }

    getVariacoes(){
        if(this.produtosHiper != undefined){
            this.produtosHiper.forEach(p => {
                if(p.produtoPrimarioId != '00000000-0000-0000-0000-000000000000'){
                    this.variacoes.push([p.produtoPrimarioId, p])
                    this.produtosHiper = this.produtosHiper.filter(produto => produto.id != p.id)
                }
            });
            
            return this.variacoes
        }

    }
}

class ProdutosWoocommerce{
    constructor(wooUrl, cKey, cSecret, produtosHiper, variacoesHiper){
        this.woocommerce = new woocommerceAPI({
            url: wooUrl,
            consumerKey: cKey,
            consumerSecret: cSecret,
            version: "wc/v3"
        })
        this.produtosHiper = produtosHiper
        this.variacoesHiper = variacoesHiper
        this.produtosWoocommerce
        this.produtosNovosWoocommerce
        this.categoriasWoocommerce
        this.atributosWoocommerce
        this.atualizar = []
        this.criar = []
    }

    async listarAtributos(){
        this.atributosWoocommerce = await this.woocommerce.get("products/attributes?per_page=100").then((r) => {
            return r.data
        })
    }

    async listarCategorias(){
        this.categoriasWoocommerce = await this.woocommerce.get("products/categories?per_page=100").then((r) => {
            return r.data
        })
    }

    async listarProdutosWoocommerce(){
        var flag = 0
        let counter = 0
        var paginasAdicionais = []

        this.produtosWoocommerce = await this.woocommerce.get("products?per_page=100").then((r) =>{
            return r.data
        }).catch(e => {
            console.log(e)
        })

        while (flag === 0) {
            try {
                const response = await this.woocommerce.get(`products?per_page=100&page=${counter + 2}`);
                const data = response.data;
                
                if (data.length > 0) {
                    paginasAdicionais[counter] = data;
                    counter++;
                } else {
                    flag = 1;
                }
            } catch (error) {
                flag = 1;
            }
        
            if (flag === 1) {
                break;
            }
        }

        this.produtosWoocommerce.push(...paginasAdicionais.flat())

        console.log('listou')
        return 'finalizado'
    }

    getProdutosWoocommerce(){
        return this.produtosWoocommerce
    }

    destinaProdutos(){
        if(this.produtosHiper == [] || this.produtosHiper == undefined){
            return false
        }

        this.produtosHiper.forEach((pHiper) => {
            var flag = 0

            this.produtosWoocommerce.forEach((pWoo) => { 
                if(pWoo.attributes[0].options[0] == pHiper.id){ // VERIFICA SE ATUALIZA
                    this.atualizar.push([pHiper, pWoo])
                    flag = 1
                }
            })

            if (flag == 0){ // VERIFICA SE CRIA
                this.criar.push(pHiper)
            }
        })

        console.log('destinou')
    }

    async criarProdutos(){
        await Promise.all(this.criar.map(async (p) => {
            let data = {
                dimensions: {
                    length: `${p.largura}`,
                    width: `${p.comprimento}`,
                    height: `${p.altura}`
                },
                status: p.ativo == true ? "publish" : "draft",
                type: p.grade == true ? "variable" : "simple",
                //images: await this.tratarImagens(p.imagensAdicionais, p.imagem),
                tag: p.marca,
                name: p.nome,
                weight: `${p.peso}`,
                description: p.descricao,
                categories: await this.criarCategorias(p),
                regular_price: `${p.preco}`,
                manage_stock: true,
                stock_quantity: (p.grade == true) ? await this.atualizarEstoque(p) : p.quantidadeEmEstoque,
                attributes: p.variacao != [] && p.variacao != null ? await this.criarAtributos(p, true) : await this.criarAtributos(p, false)
            }

            await this.woocommerce.post("products", data).then((r) => {
                this.produtosWoocommerce = [...new Set([...this.produtosWoocommerce, ...[r.data]])]
                return r.data
            }).catch(e => {
                console.log(e.response.data)
            })
        }))

        console.log('criou')
        return true
    }

    async atualizarProdutos(){
        await Promise.all(this.atualizar.map(async (p) => {
            let pHiper = p[0]
            let pWoo = p[1]

            let data = {
                dimensions: {
                   length: `${pHiper.largura}`,
                   width: `${pHiper.comprimento}`,
                   height: `${pHiper.altura}`
                },
                status: pHiper.ativo == true ? "publish" : "draft",
                type: pHiper.grade == true ? "variable" : "simple",
                //images: await this.tratarImagens(pHiper.imagensAdicionais, pHiper.imagem),
                tag: pHiper.marca,
                name: pHiper.nome,
                weight: `${pHiper.peso}`,
                description: pHiper.descricao,
                categories: await this.criarCategorias(pHiper),
                regular_price: `${pHiper.preco}`,
                manage_stock: true,
                stock_quantity: (pHiper.grade == true) ? await this.atualizarEstoque(pHiper) : pHiper.quantidadeEmEstoque,
                attributes: pHiper.variacao != [] && pHiper.variacao != null ? await this.criarAtributos(pHiper, true) : await this.criarAtributos(pHiper, false)
            }

            console.log(data.stock_quantity)
            await this.woocommerce.put(`products/${pWoo.id}`, data).then(async (r) => {
                return r.data
            }).catch(e => {
                console.log(e)
            })

            await new Promise(resolve => setTimeout(resolve, 100));
        }))

        console.log('atualizou')
        return true
    }

    // async tratarImagens(imagensAdicionais, imagemPrincipal){
    //     await Promise.all(imagensAdicionais.map(async (i) => {
    //         const link_da_imagem = i.imagem;

    //         // Fazer o download da imagem
    //         let nome_novo = await axios({
    //         method: 'get',
    //         url: link_da_imagem,
    //         responseType: 'stream'
    //         })
    //         .then(response => {
    //             if (!fs.existsSync('src')){
    //                 fs.mkdirSync('src');
    //             }

    //             let nome_novo = 'src/' + Date.now() +'.jpg'
    //             response.data.pipe(fs.createWriteStream(nome_novo));

    //             return nome_novo
    //         })
    //         console.log(nome_novo)
    //         i.src = nome_novo
    //     }))

    //     let nome_novo_imgprincipal = await axios({
    //         method: 'get',
    //         url: imagemPrincipal,
    //         responseType: 'stream'
    //         })
    //         .then(response => {
    //             if (!fs.existsSync('src')){
    //                 fs.mkdirSync('src');
    //             }

    //             let nome_novo = 'src/' + Date.now() +'.jpg'
    //             response.data.pipe(fs.createWriteStream(nome_novo));

    //             return nome_novo
    //         })

    //     let imagem_principal = [
    //         {
    //             src: nome_novo_imgprincipal
    //         },
    //     ]

    //     let arrayImagens = imagem_principal.concat(imagensAdicionais)

    //     if(arrayImagens[0].src == null){
    //         return ''
    //     }
    //     console.log(arrayImagens)
    //     return arrayImagens
    // }

    async criarCategorias(produtoHiper){
        let categoria = this.categoriasWoocommerce.find(c => c.name.toLowerCase() == produtoHiper.categoria.toLowerCase())
        if(categoria == undefined){
            console.log(produtoHiper.categoria)
        }
        return [{
            id: categoria.id
        }]
    }

    async criarAtributos(produtoHiper, atributosAdicionais){
        if(atributosAdicionais == true){
            let tipoVariacaoA = produtoHiper.variacao[0].tipoVariacaoA
            let tipoVariacaoB = produtoHiper.variacao[0].tipoVariacaoB != null ? produtoHiper.variacao[0].tipoVariacaoB : null 

            let atributosA = []
            let atributosB = []

            produtoHiper.variacao.forEach((v) => {
                atributosA.push(v.nomeVariacaoA)
                
                if(tipoVariacaoB != null){
                    atributosB.push(v.nomeVariacaoB)
                }
            })

            let idVariacaoA = this.atributosWoocommerce.find(a => a.name.toLowerCase() == tipoVariacaoA.toLowerCase())
            
            var data = [
                {
                    name: "idKey",
                    position: 0,
                    visible: false,
                    variation: false,
                    options: [produtoHiper.id]
                },
                {
                    id: idVariacaoA.id,
                    name: tipoVariacaoA,
                    position: 1,
                    visible: true,
                    variation: true,
                    options: atributosA
                }
            ]

            if(tipoVariacaoB != null){
                let idVariacaoB = this.atributosWoocommerce.find(a => a.name.toLowerCase() == tipoVariacaoB.toLowerCase())

                data.push({
                    id: idVariacaoB.id,
                    name: tipoVariacaoB,
                    position: 2,
                    visible: true,
                    variation: true,
                    options: atributosB
                })
            }
        } else {
            var data = [{
                name: "idKey",
                position: 0,
                visible: false,
                variation: false,
                options: [produtoHiper.id]
            }]
        }

        return data
    }

    async subirVariacoes(){
        if(this.variacoesHiper != undefined){
            this.variacoesHiper.forEach(async v => {
                let produtoPrimario = v[0]
                let variacao = v[1]
    
                let produtoWoocommerce = this.produtosWoocommerce.find(p => p.attributes[0].options[0] == produtoPrimario)
                console.log(produtoWoocommerce)
                let idCategoriaCor = this.atributosWoocommerce.find(a => a.name == 'Cores')
                let idCategoriaTamanho = this.atributosWoocommerce.find(a => a.name == 'Tamanhos')
    
                let data = {
                    manage_stock: true,
                    sku: `${variacao.id}`,
                    description: variacao.descricao,
                    stock_quantity: variacao.quantidadeEmEstoque,
                    regular_price: `${variacao.preco}`,
                    attributes: []
                }
    
                variacao.cor != "" ? data.attributes.push({
                    id: idCategoriaCor.id,
                    option: variacao.cor
                }) : null
    
                variacao.tamanho != "" ? data.attributes.push({
                    id: idCategoriaTamanho.id,
                    option: variacao.tamanho
                }) : null
    
                let variacoesWoocommerce = await this.getVariacoesWoocommerce(produtoWoocommerce.id)
                var flagVariacaoExistente = 0
                var variacaoExistenteId = 0
    
                variacoesWoocommerce.forEach(vw => {
                    if(vw.sku == `${variacao.id}`){
                        flagVariacaoExistente = 1
                        variacaoExistenteId = vw.id
                    }
                })
                
                if(flagVariacaoExistente == 0){
                    await this.woocommerce.post(`products/${produtoWoocommerce.id}/variations`, data).then(r => {
                        return r.data
                    }).catch(e => {
                        console.log(variacao.cor, e.response.data)
                    })
                } else {
                    await this.woocommerce.put(`products/${produtoWoocommerce.id}/variations/${variacaoExistenteId}`, data).then(r => {
                        return r.data
                    }).catch(e => {
                        console.log(variacao.nome, variacao.cor)
                    })
                }
            })
        }
    }

    async getVariacoesWoocommerce(produtoId){
        return await this.woocommerce.get(`products/${produtoId}/variations`).then(r => {
            return r.data
        })
    }

    async atualizarEstoque(produtoHiper){
        console.log('atualizando estoque')
        var estoque = 0

        this.variacoesHiper.forEach(async v => {
            let produtoPrimario = v[0]

            if(produtoPrimario == produtoHiper.id){
                let variacao = v[1]
                
                estoque += parseInt(variacao.quantidadeEmEstoque)
            }
        })

        console.log(estoque)
        return estoque
    }
}

async function start(wooUrl, cKey, cSecret, cHiper, clienteId){
    var classeHiper = new ProdutosHiper(await tokenHiper(cHiper), clienteId, await db.getPonto(clienteId))
    await classeHiper.listarProdutos()
    let variacoesHiper = classeHiper.getVariacoes()
    let produtosHiper = classeHiper.getProdutos()

    var classeWoocommerce = new ProdutosWoocommerce(wooUrl, cKey, cSecret, produtosHiper, variacoesHiper)
    await classeWoocommerce.listarProdutosWoocommerce()
    await classeWoocommerce.listarCategorias()
    await classeWoocommerce.listarAtributos()
    classeWoocommerce.destinaProdutos()
    await classeWoocommerce.atualizarProdutos()
    await classeWoocommerce.criarProdutos()
    await classeWoocommerce.subirVariacoes()
}

module.exports = start