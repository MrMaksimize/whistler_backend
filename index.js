'use strict';

const AWS = require('aws-sdk');
require("./environment.js");
var twilio = require('twilio');
var querystring = require('querystring');
var moment = require('moment');
var receiverNumbers = require('./recipients.json');



var sendMessages = function(eventInfo, done) {
    var twilio_account_sid = process.env.TWILIO_ACCOUNT_SID;
    var twilio_auth_token  = process.env.TWILIO_AUTH_TOKEN;
    var twilio_num    = process.env.MY_PHONE_NUMBER;
    var client             = new twilio.RestClient(twilio_account_sid, twilio_auth_token);
    var smsBatch = [];
    for (var i = 0; i < receiverNumbers.length; i++) {
        console.log("Send to " + receiverNumbers[i]);
        var message = client.messages.create({
            body: eventInfo.body,
            to: receiverNumbers[i],  // Text this number
            from: twilio_num, // From a valid Twilio number
            mediaUrl: eventInfo.mediaURL
        });
        smsBatch.push(message);
    }
    Promise.all(smsBatch).then(function(){
        console.log('msg sent');
        done(null, 'msges sent');
    });
}



/**
 * The following JSON template shows what is sent as the payload:
{
    "serialNumber": "GXXXXXXXXXXXXXXXXX",
    "batteryVoltage": "xxmV",
    "clickType": "SINGLE" | "DOUBLE" | "LONG"
}
 *
 * A "LONG" clickType is sent if the first press lasts longer than 1.5 seconds.
 * "SINGLE" and "DOUBLE" clickType payloads are sent for short clicks.
 *
 * For more documentation, follow the link below.
 * http://docs.aws.amazon.com/iot/latest/developerguide/iot-lambda-rule.html
 */
exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const done = (err, res) => callback(null, {
      statusCode: err ? '400' : '200',
      body: err ? err.message : JSON.stringify(res),
      headers: {
          'Content-Type': 'application/json',
      },
  });

  var eventTime = moment().format("MMM Do YYYY");
  var eventInfo = {
    body: '[' + eventTime + '] Poacher reported in area. Respond Immediately. '
  }


  if (event.serialNumber) {
      eventInfo.deviceName = event.serialNumber;
      eventInfo.latlng = "-116.999824,33.094";
      eventInfo.mediaURL = "https://api.mapbox.com/v4/mapbox.streets-satellite/" + eventInfo.latlng + ",17/300x300@2x.png?access_token=pk.eyJ1IjoibXJtYWtzaW1pemUiLCJhIjoiRlRwLWwyVSJ9.--Y4RdEJ_5ZuJjSUkx34vQ";

    switch(event.clickType) {
      case "DOUBLE":
        eventInfo.body += "Multiple units detected moving north.";
        eventInfo.mediaURL = 'https://api.mapbox.com/v4/mapbox.streets-satellite/pin-l-danger+ff0000(-116.999824,33.094),pin-l-danger+ff0000(-116.999824,33.095)/' + eventInfo.latlng + ',17/300x300@2x.png?access_token=pk.eyJ1IjoibXJtYWtzaW1pemUiLCJhIjoiRlRwLWwyVSJ9.--Y4RdEJ_5ZuJjSUkx34vQ';
        break;
      case "LONG":
        eventInfo.body += "Multiple armed units. Notified UN Peacekeepers and local military forces."
        eventInfo.mediaURL = 'https://api.mapbox.com/v4/mapbox.streets-satellite/pin-l-danger+ff0000(-116.9999,33.094),pin-l-danger+ff0000(-116.9999,33.095),pin-l-danger+ff0000(-116.9999,33.093),pin-l-danger+ff0000(-116.9992,33.094),pin-l-danger+ff0000(-116.9989,33.094)/'+ eventInfo.latlng +',17/300x300@2x.png?access_token=pk.eyJ1IjoibXJtYWtzaW1pemUiLCJhIjoiRlRwLWwyVSJ9.--Y4RdEJ_5ZuJjSUkx34vQ'
        break;
    }
  }
  // Particle
  else {
      eventInfo.deviceName = querystring.parse(event.body.data);
      eventInfo.latlng = "-116.999824,33.094";
      eventInfo.mediaURL = 'https://api.mapbox.com/v4/mapbox.streets-satellite/pin-l-danger+ff0000(-116.999824,33.094)/'+ eventInfo.latlng +',17/300x300@2x.png?access_token=pk.eyJ1IjoibXJtYWtzaW1pemUiLCJhIjoiRlRwLWwyVSJ9.--Y4RdEJ_5ZuJjSUkx34vQ'
  }



  sendMessages(eventInfo, done);


}
