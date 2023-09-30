const axios = require("axios");
/* imports */ 

class TokenHiper {
    constructor(chaveDeSeguranca) { // construtor
        this.chaveDeSeguranca = chaveDeSeguranca;
        this.url =
            "http://ms-ecommerce.hiper.com.br/api/v1/auth/gerar-token/" +
            this.chaveDeSeguranca;
        this.token;
    }

    async getToken() { // pega o token hiper com validade
        this.token = axios({
            url: this.url,
            method: "get",
        }).then((response) => {
            return response.data.token;
        });

        return this.token;
    }
}

function token(chave){ // construtor
    let tokenHiper = new TokenHiper(chave);

    return tokenHiper.getToken()
}

module.exports = token