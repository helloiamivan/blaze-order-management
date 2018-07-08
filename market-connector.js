const request = require('request');
var fs = require('fs');

// Read in the connection string from local json file
var connectionData = JSON.parse(fs.readFileSync('market-data.json', 'utf8'));

function getOrderBookConn(symbol,exchange) {
  var url = connectionData[exchange].BASE_URL + connectionData[exchange].BOOK_URL;
  url = url.replace("${SYMBOL}", symbol);
  return url
}

x = getOrderBookConn("ETHUSD","bitfinex")

console.log(x)
