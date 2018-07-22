const request = require('request');
var fs = require('fs');

// Read in the connection string from local json file
var connectionData = JSON.parse(fs.readFileSync('market-data.json', 'utf8'));

function getOrderBookConn(symbol,exchange) {
  var url = connectionData[exchange].BASE_URL + connectionData[exchange].BOOK_URL;
  exchangeSym = connectionData[exchange][symbol]
  url = url.replace("${SYMBOL}", exchangeSym);
  return url
}

function getData(connectionString) {

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
	  console.log(JSON.stringify(results))
	});
}

var side = 'ASKS'

var coin = 'BTC'

const exchanges = ["huobi","kraken","bitfinex","quoine"];

connectionString = getOrderBookConn(coin,"kraken")

for (i in exchanges) {
	exchange = exchanges[i]
	connectionString = getOrderBookConn(coin,exchange)
	getData(connectionString);
}


