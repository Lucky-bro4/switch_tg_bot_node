const sequelize = require('../db')
const { DataTypes } = require('sequelize')


const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.STRING, unique: true},
    login: {type: DataTypes.STRING, unique: true},
    phone_number: {type: DataTypes.STRING},
    location: {type: DataTypes.STRING},
})

module.exports = User;