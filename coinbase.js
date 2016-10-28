var rest = require('restler')
  , repl = require('repl')
  , config = require('./config')
  , fs = require('fs')
  , csv = require('fast-csv')
  , uu = require('underscore');

var red = '\u001b[31m'
  , bold = '\u001b[1m'
  , reset = '\u001b[0m';

var orders = {};
var market = {
  rates: {}
};
//Credits https://github.com/martindale/coinbase-trader
// Buy method and boiler code taken from above repository.
//Modified code to fit the need.
// always start with good exchange rates.
rest.get('https://coinbase.com/api/v1/currencies/exchange_rates').on('complete', function(data, res) {
  market.rates = data;
});

console.log(bold + 'Coinbase program' + '\n   Syntax: BUY <amount> [currency]\n Syntax: SELL <amount> [currency]\n Syntax: Orders - check list of orders and store in csv\n');

repl.start({
    prompt: 'coinbase> '
  , eval: function(cmd, context, filename, callback) {

      var tokens = cmd.toLowerCase().replace('(','').replace(')','').replace('\n', '').split(' ');
      var amount = parseFloat(tokens[1]);
      var orderID = new Date().toString();
      var denomination = 'BTC';
      var priceCeiling = 1000.0;


      if(tokens[0] == 'orders'){


        rest.get('https://coinbase.com/api/v1/currencies/exchange_rates').on('complete', function(data, res) {
          if (res.statusCode == 200) {
            market.rates = data;
          }
        });

        console.log('CURRENT BTC/USD: ' + market.rates.btc_to_usd);
        console.log('=== CURRENT ORDERS ===');

        Object.keys(orders).forEach(function(orderID) {
          var order = orders[ orderID ];
         console.log(orderID + ' : ' + order.type.toUpperCase() + ' ' + order.amount + ' : UNFILLED');



       });

       Object.keys(orders).forEach(function(orderID2) {
          var order2 = orders[ orderID2 ];

         var transformedOrders = uu.map({ "timestamp":orderID2,
         "buy/sell type":order2.type,
         "amount":order2.amount,
         });

           var writableStream = fs.createWriteStream("my.csv");
         csv.write(transformedOrders,{headers :true}).pipe(writableStream);




        });
console.log('Stored in my.csv file');
      }
      if (typeof(tokens[2]) != 'undefined') {
        denomination = tokens[2].toUpperCase();
      }
      if (typeof(tokens[3]) != 'undefined') {
        priceCeiling = parseFloat(tokens[3]);
      }

      if (!amount) {
        callback('---------');
      } else {
        switch (tokens[0]) {
          case 'buy':

            if (denomination != 'BTC') {
              var originalCurrency = amount;
              var rate = market.rates[ 'btc_to_' + denomination.toLowerCase() ];
              if (typeof(rate) != 'undefined') {

                orders[ orderID ] = {
                    type: 'buy'
                  , amount: amount
                  , denomination: denomination
                  , priceCeiling: priceCeiling
                  , agent: setTimeout(function() {
                      executeOrder( orderID );
                    }, 1) // issue order immediately.
                };

                amount = (amount - 0.15) / ( 1.01 * rate);

                callback('Order to BUY ' + tokens[1] + ' ' + denomination + ' worth of BTC queued @ ' + rate + ' BTC/' + denomination + ' (' + amount + ' BTC) below ' + priceCeiling );

              } else {
                console.log('No known exchange rate for BTC/' + denomination + '. Order failed.');
              }

            } else {

              orders[ orderID ] = {
                  type: 'buy'
                , amount: amount
                , denomination: denomination
                , agent: setTimeout(function() {
                    executeOrder( orderID );
                  }, 1) // issue order immediately.
              };

              callback('Order to BUY ' + tokens[1] + ' BTC queued.');
            }

          break;
          case 'sell':
          if (denomination != 'BTC') {
            var originalCurrency = amount;
            var rate = market.rates[ 'btc_to_' + denomination.toLowerCase() ];
            if (typeof(rate) != 'undefined') {

              orders[ orderID ] = {
                  type: 'sell'
                , amount: amount
                , denomination: denomination
                , priceCeiling: priceCeiling
                , agent: setTimeout(function() {
                    executeOrder( orderID );
                  }, 1) // issue order immediately.
              };

              amount = (amount - 0.15) / ( 1.01 * rate);

              callback('Order to sell ' + tokens[1] + ' ' + denomination + ' worth of BTC queued @ ' + rate + ' BTC/' + denomination + ' (' + amount + ' BTC) below ' + priceCeiling );

            } else {
              console.log('No known exchange rate for BTC/' + denomination + '. Order failed.');
            }

          } else {

            orders[ orderID ] = {
                type: 'sell'
              , amount: amount
              , denomination: denomination
              , agent: setTimeout(function() {
                  executeOrder( orderID );
                }, 1) // issue order immediately.
            };

            callback('Order to Sell ' + tokens[1] + ' BTC queued.');
          }
          break;

          default:
            console.log('unknown command: "' + cmd + '"');
          break;
        }
      }

    }
});



function executeOrder(orderID) {
  var order = orders[ orderID ];
  var amount = parseFloat(order.amount);

  if (order.denomination != 'BTC') {
    var originalCurrency = amount;
    amount = (amount - 0.15) / ( 1.01 * market.rates[ 'btc_to_' + order.denomination.toLowerCase() ]);
    /* console.log('at current rate, ' + originalCurrency + ' ' + order.denomination + ' will buy ' + amount + ' BTC.'); */
  }

  switch(order.type) {
    case 'buy':
      console.log('Attempting to buy ' + amount + ' BTC...');


    break;
  }
  switch(order.type) {
    case 'sell':
      console.log('Attempting to SELL ' + amount + ' BTC...');
      break;
    }

}
