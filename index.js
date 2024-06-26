const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const UserModel = require('./models/models');

const token = '7398795259:AAHjSGlszFTKruI6a2YiEgUPvuqGP3lU2vQ'
const webAppUrl = 'https://celadon-starburst-c6387c.netlify.app/'
const adminChatId = 701729944
let message_id = 0

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

      const saleText = `👇 Заглядывай к нам на сайт и создавай свой идеальный образ!\n`

      await bot.sendMessage(chatId, saleText, {
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
    } else if (text === 'Как работает Switch?') {

      message_how_switch_works = `Switch - сервис по шэрингу одежды\n
- перед тем как вещи попадают в каталог, проводится обязательный этап отбора, оценки и химчистки одежды.
- вещи более непригодные к ношению или не пользующиеся спросом у пользователей сдаются в социальные фонды или отправляются на переработку в зависимости от состояния.
- <b>ВНИМАНИЕ:</b> убедительно просим вас относиться к вещам аккуратно, в таком случае они смогут принести пользу и другим пользователям.
<em>Ответственность за утерю / порчу вещей сервис полностью берет на себя. Носите с удовольствием!</em>\n
<b>Как сделать заказ?</b>\n
1. Выберите вещи, представленные в каталоге, и добавить их в личный кабинет (вещи попадают в раздел "Понравившееся")\n
2. В личном кабинете выберите 4 товара, которые больше всего понравились, и оформите доставку, указав адрес и номер телефона для связи\n
3. В течение 2-х часов курьер привезет комплект одежды на указанный адрес\n
4. Через 24 часа, если вы не продлили аренду или не собрали новый сет, курьер приедет забрать вещи (за 2 часа до конца аренды мы пришлем уведомление в чат)\n
5. одежда проходит детальную оценку и химчистку после чего распределяется в сервис / фонды / переработку.


<b>Доставка осуществляется только по г. Санкт-Петербургу 8:00-24:00</b>`

      await bot.sendMessage(chatId, message_how_switch_works, {parse_mode: 'HTML'})
    } else if (text === 'Связаться с нами') {

      message_to_connect_with = `Если у вас возникли вопросы и/или затруднения в работе с сервисом:\n
1. Нажав на кнопку "Написать", пришлите сообщение в чат и мы его получим.\n
2. Написать на почту hello.switch@yandex.ru, ответим максимально оперативно.`

      await bot.sendMessage(chatId, message_to_connect_with, {
        reply_markup: {
          inline_keyboard: [
            [{text: 'Написать', callback_data: 'message_to_bot'}],
          ]
        }
      })

      bot.on('callback_query', msg => {
        const data = msg.data
        // const {message_id, text} = msg.message
        if (data === 'message_to_bot') {
          bot.sendMessage(chatId, 'Записываю ✍️')
          bot.on('message', async mg => {
            message_id = mg.message_id
            if (mg.text === 'Как работает Switch?' || 'Связаться с нами' || 'Заполните форму 🗒') {
              return
            } else {
              await bot.forwardMessage(adminChatId, chatId, message_id)
              await bot.sendMessage(chatId, `Получили ваше обращение, ответим в ближайшее время в чате ${message_id}`, {
                reply_to_message_id: message_id
              })
            }
          })
        }
      })
      
    } else {
        await bot.sendMessage(chatId, 'Хорошая попытка, но я ничего не понял 🦿🦾')
    }

  } catch (e) {
    console.log('Бот не дышит!', (e))
    return bot.sendMessage(chatId, 'Бот не дышит! Произошла ошибка, мы скоро все исправим 🏥')
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