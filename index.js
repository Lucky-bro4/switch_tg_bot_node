const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const { Item, verifyUser, reservItem } = require ('./models/models');
require('dotenv').config()

let message_id = 0

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
const app = express();
const adminChatId = 701729944
let chatId = 0
app.use(express.json());
app.use(cors());

bot.setMyCommands([
  {command: '/start', description: 'Перезапустить'}
])

bot.on('message', async (msg) => {

  chatId = msg.chat.id;
  const text = msg.text;
  const username = msg.from.username;


  try {

    if(text === '/start') {
      
      const user = await verifyUser(chatId, username)

      const presaleText = `Switch - инновационный способ осознанного потребления и твой ключ к свободному гардеробу.\n
🌟 Твой гардероб дышит свободой - больше никаких завалов из одежды, которую "когда-нибудь надену"!
💰 Твой кошелек скажет спасибо - покупай меньше, а стильных вещей носи больше!
🌍 Планета тебе благодарна - мы поддерживаем осознанное потребление и вместе боремся с перепроизводством!\n
✨ Switch - это твой путь к осознанному стилю!`
      
      if (chatId === adminChatId) {
        await bot.sendMessage(chatId, presaleText, {
          reply_markup: {
            keyboard: [
              ['Как работает Switch?', 'Связаться с нами'],
              ['/addProduct']
            ],
            resize_keyboard: true
          }
        })
      } else {
        await bot.sendMessage(chatId, presaleText, {
          reply_markup: {
            keyboard: [
              ['Как работает Switch?', 'Связаться с нами'],
              [{text: 'Заполните форму 🗒', web_app: {url: process.env.WEB_APP_URL + 'form'}}]
            ],
            resize_keyboard: true
          }
        })
      }
      
      
      const saleText = `👇 Заглядывай к нам на сайт и создавай свой идеальный образ!\n`

      await bot.sendMessage(chatId, saleText, {
        reply_markup: {
          inline_keyboard: [
            [{text: 'Сделать заказ', web_app: {url: process.env.WEB_APP_URL}}]
          ]
        }
      })

    } else if (text === 'Как работает Switch?') {


      const message_how_switch_works = `Switch - это сервис по шэрингу одежды\n
- перед тем как вещи попадают в каталог, проводятся обязательные этапы отбора, оценки и химчистки одежды.
- вещи более непригодные к ношению или не пользующиеся спросом у пользователей в зависимости от состояния сдаются в социальные фонды или отправляются на переработку.\n
- <b>ВНИМАНИЕ:</b> убедительно просим вас относиться к вещам аккуратно, в таком случае они еще смогут принести пользу и другим пользователям.\n
<b>Как сделать заказ?</b>\n
1. Выберите до 4-х вещей, представленных в каталоге и нажмите "Заказать".\n
2. Оформите доставку, указав адрес и номер телефона для связи.\n
3. В течение 4-х часов курьер привезет комплект одежды на указанный адрес.\n
4. Через 24 часа, если вы не продлили аренду или не собрали новый сет, курьер приедет забрать вещи (за 2 часа до конца аренды мы пришлем уведомление в чат)\n
5. Одежда проходит детальную оценку и химчистку после чего распределяется в сервис / фонд / переработку.

<b>Заказы, оформленные с 8:00 до 21:00, доставляются в этот же день, остальные переносятся на следующий день.\n
Доставка осуществляется только по г. Санкт-Петербургу.</b>`

      await bot.sendMessage(chatId, message_how_switch_works, {parse_mode: 'HTML'})
    } else if (text === 'Связаться с нами') {

      message_to_connect_with = `Если у вас возникли вопросы и/или затруднения в работе с сервисом:\n
1. Нажав на кнопку "Написать", пришлите сообщение в чат и мы его получим.\n
2. Почта: hello.switch@yandex.ru`

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
              await bot.forwardMessage(ADMIN_CHAT_ID, chatId, message_id)
              await bot.sendMessage(chatId, `Получили ваше обращение, ответим в ближайшее время в чате ${message_id}`, {
                reply_to_message_id: message_id
              })
            }
          })
        }
      })
      
    } // else {
    //     await bot.sendMessage(chatId, 'Хорошая попытка, но я ничего не понял 🦿🦾')
  // }

    if (text === '/addProduct' && chatId === adminChatId) {
      
        const product = ''
        let item = product
          
    } else if (text === 'Куртка;Куртка осенняя;5;12000;фото') {
      try {
        await sequelize.authenticate()
        await sequelize.sync()
        .then(() => Item.create({
          category: text.split(';')[0],
          name: text.split(';')[1],
          condition: text.split(';')[2],
          price: text.split(';')[3],
          image: text.split(';')[4],
          })
        )
        bot.sendMessage(chatId, 'Успешно отправилось')
      } catch (e) {
        console.log('Подключение к бд item сломалось', e)
        bot.sendMessage(chatId, `Подключение к бд item сломалось ${e}`)
      }
    }

    

  } catch (error) {
    console.log('Бот не дышит!', (error))
    await bot.sendMessage(chatId, 'Бот не дышит! Произошла ошибка, мы скоро все исправим 🏥')
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

bot.on('callback_query', async message => {

  try {
    const data = message.data
    // const {message_id, text} = msg.message
    if (data === 'order_confirm') {
      bot.sendMessage(chatId, 'Выберите способ оплаты', {
        reply_markup: {
          inline_keyboard: [
            [{text: '💸Наличными', callback_data: 'cash'}], [{text: '💳Банковской картой', callback_data: 'card'}]
          ]
        }
      })
  }
  } catch (e) {
    console.log('Ошибка выбора оплаты' + e)
  }
})

bot.on('callback_query', async message => {

  try {
    const data = message.data
    // const {message_id, text} = msg.message
    if (data === 'card') {
      await bot.sendInvoice(chatId, 'Свитч', 'Оплата заказа', 'invoce_from_tg_bot', process.env.PAYMENT_TOKEN, 'RUB', [{label: 'Оплата заказа', amount: switchPrice * 100}], {
        photo_url: `${process.env.WEB_APP_URL}/Images/mainLogoLarge2w.png`,
        photo_height: 280,
        photo_width: 280,
        need_phone_number: Boolean(true),
        need_shipping_address: Boolean(true),
      })
    return 'success'
  }
  } catch (e) {
    console.log('Ошибка вызова оплаты' + e)
  }
})

let switchPrice = 0
app.post( '/web-data', async (req, res) => {
  
  const {queryId, products, totalPrice} = req.body;
  switchPrice = totalPrice
  reservItem(chatId, products)
  try {
    let media_array = []
    for (i = 0; i < products.length; i++) {
      let photo_url = process.env.WEB_APP_URL + products[i].img
      media_array.push({type: 'photo',
        media: photo_url, 
        parse_mode: 'HTML'})
    }

    // [products.map(item => process.env.WEB_APP_URL + item.img, {parse_mode: 'HTML'})]
    await bot.sendMediaGroup(chatId, media_array)
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      // Поздравляем с первым свитчем! За 3 часа до конца аренды мы пришлем напоминание в чат. Вы можете оставить вещи еще на сутки или выбрать что-то другое - выбор за вами!
      title: 'Успешная покупка',
      input_message_content: {
        message_text: `<b>Твой заказ:</b>
${products.map(item => item.title).join(`\n`)}\n
Стоимость свитча: ${switchPrice}`,
        parse_mode: 'HTML'},
      reply_markup: {
        inline_keyboard: [
          [{text: 'Подтверждаю', callback_data: 'order_confirm'}],
          [{text: 'Выберу что-то другое', web_app: {url: process.env.WEB_APP_URL}}]
        ]
      }
    })
  
    return res.status(200).json({});
  } catch (e) {
      await bot.answerWebAppQuery(queryId, {
        type: 'article',
        id: queryId,
        title: 'Не удалось собрать заказ',
        input_message_content: {message_text: 'Не удалось собрать заказ'}
      })
    console.log('Ошибка подтверждения оплаты' + e)
    return res.status(500).json({});
  }
})

app.post( '/newProduct', async (req, res) => {
  
  const { category, name, condition, price, photo } = req.body;
  console.log(req.body)
  
  try {

    item = await Item.create({
      category: category,
      name: name,
      condition: condition,
      price: price,
      image: process.env.WEB_APP_URL + photo,
      status: 'available',
      available: Boolean(true)
    })

    return res.status(200).json({});
  } catch (e) {
    console.log('Ошибка при добавлении товара' + e)
    return res.status(500).json({});
  }
})

app.get( '/products', async (req, res) => {
  
  try {
    const products = await Item.findAll(({ where: { available: Boolean(true) }}));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении списка товаров' });
  }  

})



app.listen(process.env.PORT, async () => {
  console.log('server started on PORT ' + process.env.PORT)

  try {
    await sequelize.sync()
    console.log('База данных синхронизирована')
  } catch (e) {
    console.log('Ошибка синхронизации БД:', e)
  }
})