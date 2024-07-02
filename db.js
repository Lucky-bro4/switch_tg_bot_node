const Sequelize = require('sequelize')

module.exports = new Sequelize(
    'switchdb',
    'switchadmin',
    'qwerty',
    {
        host: 'amvera-lucky-bro4-cnpg-switch-db-rw',
        port: '5432',
        dialect: 'postgres',
    }
    
)