const Sequelize = require('sequelize')

module.exports = new Sequelize(
    'switchdb',
    'switchadmin',
    'qwerty1357924680songP',
    {
        host: 'amvera-lucky-bro4-cnpg-switch-db-rw',
        port: '5432',
        dialect: 'postgres',
    }
    
)