async function connect() {
    if (global.connection && global.connection.state !== 'disconnected'){
        global.connection.end()
    }

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
        host: 'mysql.tecleweb.dev.br',
        user: 'tecleweb18_add2',
        password: 'Tecle@123',
        database: 'tecleweb18'
    })
    global.connection = connection

    return connection
}

async function selectCustomers(){
    const conn = await connect()
    const [rows] = await conn.query('SELECT * FROM config_api')
    return await rows
}

async function getPonto(id){
    const conn = await connect()
    const [rows] = await conn.query(`SELECT * FROM config_api WHERE id = ${id}`)
    return await rows[0].ponto_sinc
}

async function getData(id){
    const conn = await connect()
    const [rows] = await conn.query(`SELECT * FROM config_api WHERE id = ${id}`)
    return await rows[0].data_sinc
}

async function setPonto(id, ponto){
    const conn = await connect()
    const sql = `UPDATE config_api SET ponto_sinc=? WHERE id = ${id}`
    const values = ponto
    await conn.query(sql, values)
}

async function setData(id, ponto){
    const conn = await connect()
    const sql = `UPDATE config_api SET data_sinc=? WHERE id = ${id}`
    const values = [ponto]
    await conn.query(sql, values)
}

module.exports = {selectCustomers, getPonto, getData, setPonto, setData}
