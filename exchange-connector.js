const request = require('request');
var fs = require('fs');

fs.readFile('file', 'utf8', function (err, data) {
  if (err) throw err;
  obj = JSON.parse(data);
});

// Executable volume (Sell)
var executable_vol = 500
// Enter B if client wants to BUY, enter S if client wants to SELL
var side = 'S'
// Enter the fiat/crypto pair
var symbol = 'ethusd'
// Mark up with commission (50 bps default)
var commission = 0.005
// TODO: add a risk penalty to account for market volatility

// Gemini Only
request('https://api.gemini.com/v1/book/'.concat(symbol), { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  
  if (side == 'S'){
    var orderbook = body.bids;
  }

  else if (side == 'B') {
    var orderbook = body.asks;
  }

  else {
    throw 'Unrecognized side of trade';
  }
  //console.log(orderbook)
  // Get the VWAP if we execute in this instant
  var volume = Number(0);
  var vwap_notional = Number(0);

  // Loop through the orderbook (ASYNC)
  for (var i = 0; i < orderbook.length; i++){
    var obj = orderbook[i];

    if (volume < executable_vol){
      var price = Number(obj.price);
      var size = Number(obj.amount);
      vwap_notional = vwap_notional + (price * size)
      volume = volume + size;
    }
    
  }

  // TODO: Compute risk through order book imbalance (ASYNC)

  // TODO: Place limit orders instead of market orders for RFQs

  console.log('Average trading in Gemini price will be: '.concat(String(vwap_notional/volume)));
  
  if (side == 'B'){
    console.log('Qouted price to SELL to client: '.concat(vwap_notional*(1 + commission)/volume))  
  }
  else{
    console.log('Qouted price to BUY from client: '.concat(vwap_notional*(1 - commission)/volume))  
  }

});

