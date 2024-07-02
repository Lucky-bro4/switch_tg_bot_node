const sequelize = require('../db')
const { DataTypes } = require('sequelize')


const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.STRING, unique: true},
    login: {type: DataTypes.STRING},
    phone_number: {type: DataTypes.STRING},
    location: {type: DataTypes.STRING},
})

const Item = sequelize.define('items', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    // chatId: {type: DataTypes.STRING, unique: true},
    // login: {type: DataTypes.STRING, unique: true},
    category: {type: DataTypes.STRING},
    name: {type: DataTypes.STRING},
    condition: {type: DataTypes.STRING},
    price: {type: DataTypes.STRING},
    image: {type: DataTypes.STRING},
    status: {type: DataTypes.STRING},
    available: {type: DataTypes.BOOLEAN},
})


User.hasMany(Item)
Item.belongsTo(User)

async function verifyUser(userChatId, username) {
    try {

        userChatId = String(userChatId)
        let user = await User.findOne(({ where: { chatId: userChatId } }))

        if (!user) {
            user = await User.create({
                chatId: userChatId,
                login: username,
            });
            console.log('Новый пользователь создан!'); 
        } else {
            console.log('Пользователь существует');
        }
        return user

    } catch (error) {
        console.log('Ошибка при проверке пользователя:', error);
        throw error;
    }
  }

async function reservItem(userChatId, products) {
    try {
    
        userChatId = String(userChatId)
        let item_id = 0

        for (i = 0; i < products.lenght; i++) {

            item_id = products[i].id
            let item = await Item.findOne(({ where: { id: item_id } }))

            if (!item) {
                item = await Item.create({
                    status: 'reserved',
                    available: Boolean(false)
                });
                console.log('Новый товар создан!'); 
            } else {
                console.log('Товар существует');
            }
        }

    } catch (error) {
        console.log('Ошибка при поиске товаров:', error);
        throw error;
    }
  }


module.exports = {User, Item, verifyUser, reservItem};