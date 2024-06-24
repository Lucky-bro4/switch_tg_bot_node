const Sequelize = require('sequelize')

module.exports = new Sequelize(
    'switch_bot',
    'postgres',
    'qwerty1234',
    {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
    }
)