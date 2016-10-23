var Client = require('coinbase').Client;
var request = require('request');
var csv = require("fast-csv");
var fs = require('fs');
var client = new Client({  'apiKey': 'nhQgfIcZlBMNnG5V',
  'apiSecret': 'AuYffC9P3oymB1OLfj3Cb4t0l3GaKZGP'});

  var repl = require("repl");

  client.getExchangeRates({'currency': 'BTC'}, function(err, rates) {
    var obj = {rates};
    var arr = Object.keys(obj).map(function (key) { return obj[key]; });
    var rates = Object.keys(arr).map(function (key) { return obj[arr]; });
  });


 var r = repl.start({prompt: 'coinbase>', eval: myEval, writer: myWriter});

         function myEval(cmd, context, filename, callback) {
           callback(null,cmd);
         }

         //function myWriter(output) {
//var writableStream = fs.createWriteStream("my.csv");
//csv.write(orders).pipe(writableStream);
//var orders = [];
  //         var k = output.split(/[ ]+/);
    //       orders.push(output);
//'Order to '+orders+' BTC  queued ';
  //       }



    var orders = [];


          function myWriter(input) {
var k =  input.substr(0,input.indexOf(' '));
var order = input.substring(0,6);

            if(k=== "BUY" || k==="buy"){

              orders.push(input);
            return  'Order to '+orders+' BTC  queued ';
            }
            if(k === "Sell"||k === "sell"|| k === "SELL"){
                orders.push(input);
            return  'Order to '+input+' BTC  queued ';

            }
            if(order === "orders"||order === "ORDERS"|| order === "Orders"){
              var writableStream = fs.createWriteStream("my.csv");
              csv.write(orders).pipe(writableStream);

            return  orders;
            }
            else{
            return  'commmands to not recognized';
            }
          }
