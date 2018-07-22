const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const btoa = require('btoa');
const request = require('request');
var fs = require('fs');

// Bot Token
const bot = new Telegraf('655584600:AAE5f29EyGlWmsBVn7LfloGaPGNpWu_mrVI')

// Mongo DB initialization
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://telegram_bot:3kFAYPtEWlT5c0Kf@frankfurt-jcg1n.mongodb.net/test";

// Exchanges to connect to
const exchanges = ["huobi","kraken","bitfinex","quoine"];

// Read in the connection string from local json file
var connectionData = JSON.parse(fs.readFileSync('market-data.json', 'utf8'));

function getOrderBookConn(symbol,exchange) {
  var url = connectionData[exchange].BASE_URL + connectionData[exchange].BOOK_URL;
  exchangeSym = connectionData[exchange][symbol]
  url = url.replace("${SYMBOL}", exchangeSym);
  return url
}

function getData(connectionString,ctx,side) {

  return new request(connectionString, { json: true }, (err, res, body) => {
    
    if (err) { return console.log(err);}

    var results = {}

    if (connectionString.includes(".bitfinex")) {
      results = body[connectionData['bitfinex'][side]][0]
      results['source'] = 'bitfinex'
    }

    else if (connectionString.includes(".quoine")) {
      temp = body[connectionData['quoine'][side]][0]
      results['price'] = temp[0].toString()
      results['amount'] = temp[1].toString()
      results['timestamp'] = 'unknown'
      results['source'] = 'quoine'
    }  

    else if (connectionString.includes(".huobi")) {
      temp = body['tick'][connectionData['huobi'][side]][0]
      results['price'] = temp[0].toString()
      results['amount'] = temp[1].toString()
      results['timestamp'] = body['ts'].toString()
      results['source'] = 'huobi'
    }  

    else if (connectionString.includes(".kraken")) {
      for (var key in body.result){
        temp = body.result[key][connectionData['kraken'][side]][0]
        results['price'] = temp[0]
        results['amount'] = temp[1]
        results['timestamp'] = temp[2].toString()
        results['source'] = 'kraken'
      }
    }
    ctx.reply(JSON.stringify(results))
  });
}

bot.command('start', ({ reply }) => {
  return reply('Test bot to expose price querying infrastructure', Markup
    .keyboard([
      ['BTC BIDS','ETH BIDS'],
      ['BTC ASKS','ETH ASKS']
    ])
    .resize()
    .extra()
  )
})

bot.hears('BTC BIDS', ctx => {
  const user_name = ctx.message.from.username;
  var side = 'BIDS'
  var coin = 'BTC'

  for (i in exchanges) {
    exchange = exchanges[i]
    connectionString = getOrderBookConn(coin,exchange)
    getData(connectionString,ctx,side);
  }
})

bot.hears('BTC ASKS', ctx => {
  const user_name = ctx.message.from.username;
  var side = 'ASKS'
  var coin = 'BTC'

  for (i in exchanges) {
    exchange = exchanges[i]
    connectionString = getOrderBookConn(coin,exchange)
    getData(connectionString,ctx,side);
  }  
})

bot.hears('ETH BIDS', ctx => {
  const user_name = ctx.message.from.username;
  var side = 'BIDS'
  var coin = 'ETH'

  for (i in exchanges) {
    exchange = exchanges[i]
    connectionString = getOrderBookConn(coin,exchange)
    getData(connectionString,ctx,side);
  }  
})

bot.hears('ETH ASKS', ctx => {
  const user_name = ctx.message.from.username;
  var side = 'ASKS'
  var coin = 'ETH'

  for (i in exchanges) {
    exchange = exchanges[i]
    connectionString = getOrderBookConn(coin,exchange)
    getData(connectionString,ctx,side);
  }  
})

bot.command('cancel', ctx => {
  ctx.reply('Bot session terminated, press /start to use again')
})

bot.startPolling()
console.log('Bot is now running!')