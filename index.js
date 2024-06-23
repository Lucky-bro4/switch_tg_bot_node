const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '7398795259:AAHjSGlszFTKruI6a2YiEgUPvuqGP3lU2vQ'
const webAppUrl = 'https://celadon-starburst-c6387c.netlify.app/'

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if(text === '/start') {
      await bot.sendMessage(chatId, 'Ниже появится кнопка "Заполните форму", будем рады вашей обратной связи!', {
        reply_markup: {
          keyboard: [
            [{text: 'Заполните форму', web_app: {url: webAppUrl + 'form'}}]
          ]
        }
      })

      await bot.sendMessage(chatId, 'Заходи в Каталог и выбирай любые 5 предметов на свой вкус', {
        reply_markup: {
          inline_keyboard: [
            [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
          ]
        }
      })
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
      input_message_content: {message_text: 'Поздравляем с первым свитчем! За 3 часа до конца аренды мы пришлем напоминание в чате. Вы можете оставить вещи еще на сутки или выбрать что-то другое - выбор за вами!'}
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