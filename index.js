const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const UserModel = require('./models');

const token = '7398795259:AAHjSGlszFTKruI6a2YiEgUPvuqGP3lU2vQ'
const webAppUrl = 'https://celadon-starburst-c6387c.netlify.app/'

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.setMyCommands( [
  {command: '/start', description: 'Перезапустить'}
])

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const username = msg.from.username;

  const presaleText = `Switch - инновационный способ осознанного потребления и твой ключ к свободному гардеробу.\n
🌟 Твой гардероб дышит свободой - больше никаких завалов из одежды, которую "когда-нибудь надену"!
💰 Твой кошелек скажет спасибо - покупай меньше, а стильных вещей носи больше!
🌍 Планета тебе благодарна - мы поддерживаем осознанное потребление и вместе боремся с перепроизводством!\n
✨ Switch - это твой путь к осознанному стилю!`


  try {
    if(text === '/start') {

      try {
        await UserModel.create({chatId, login: username})
      } catch (e) {}

      await bot.sendMessage(chatId, presaleText, {
        reply_markup: {
          keyboard: [
            ['Как работает Switch?', 'Связаться с нами'],
            [{text: 'Заполните форму 🗒', web_app: {url: webAppUrl + 'form'}}]
          ],
          resize_keyboard: true
        }
      })

      await bot.sendMessage(chatId, `👇 Заглядывай к нам на сайт и создавай свой идеальный образ! \n
💚 С любовью к стилю и планете, твой Switch.`, {
        reply_markup: {
          inline_keyboard: [
            [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
          ]
        }
      })

      try {
        await sequelize.authenticate()
        await sequelize.sync()
      } catch (e) {
        console.log('Подключение к бд сломалось', e)
      }
    } else {
      bot.sendMessage(chatId, 'Хорошая попытка, но я ничего не понял 🦿🦾')
    }

  } catch (e) {
    console.log('Бот не дышит!', (e))
    return bot.sendMessage(chatId, 'Бот не дышит! Произошла ошибка, мы скоро все исправим')
  }

  if(msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data)
      console.log(data)
      await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
      await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
      await bot.sendMessage(chatId, 'Ваша улица ' + data?.street);

      setTimeout( async () => {
        await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
      }, 3000)
    } catch (e) {
        console.log(e)
    }
  }
});

app.post( '/web-data', async (req, res) => {
  
  const {queryId, products, totalPrice} = req.body;

  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка',
      input_message_content: {message_text: 'Поздравляем с первым свитчем! За 3 часа до конца аренды мы пришлем напоминание в чат. Вы можете оставить вещи еще на сутки или выбрать что-то другое - выбор за вами!'}
    })
    return res.status(200).json({});
  } catch (e) {
      await bot.answerWebAppQuery(queryId, {
        type: 'article',
        id: queryId,
        title: 'Не удалось приобрести товар',
        input_message_content: {message_text: 'Не удалось приобрести товар'}
      })
    return res.status(500).json({});
  }
})


const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))