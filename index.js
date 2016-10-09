'use strict';

const AWS = require('aws-sdk');
require("./environment.js");
var twilio = require('twilio');

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
exports.handler = function(event, context) {
  console.log(event);
  var default_receiver = "+17736777755"
  var receiverNumbers = [
      "+18587171440",
      "+17736777755"
  ]
  var twilio_account_sid = process.env.TWILIO_ACCOUNT_SID;
  var twilio_auth_token  = process.env.TWILIO_AUTH_TOKEN;
  var twilio_num    = process.env.MY_PHONE_NUMBER;
  var client             = new twilio.RestClient(twilio_account_sid, twilio_auth_token);
  var body = ''
  var mediaURL = ''
  var singleMedia = 'https://api.mapbox.com/v4/mapbox.streets-satellite/-116.999824,33.094,17/300x300@2x.png?access_token=pk.eyJ1IjoibXJtYWtzaW1pemUiLCJhIjoiRlRwLWwyVSJ9.--Y4RdEJ_5ZuJjSUkx34vQ'
  var doubleMedia = 'https://api.mapbox.com/v4/mapbox.streets-satellite/pin-l-danger+ff0000(-116.999824,33.094),pin-l-danger+ff0000(-116.999824,33.095)/-116.9999,33.094,17/300x300@2x.png?access_token=pk.eyJ1IjoibXJtYWtzaW1pemUiLCJhIjoiRlRwLWwyVSJ9.--Y4RdEJ_5ZuJjSUkx34vQ'
  var longMedia = 'https://api.mapbox.com/v4/mapbox.streets-satellite/pin-l-danger+ff0000(-116.9999,33.094),pin-l-danger+ff0000(-116.9999,33.095),pin-l-danger+ff0000(-116.9999,33.093),pin-l-danger+ff0000(-116.9992,33.094),pin-l-danger+ff0000(-116.9989,33.094)/-116.9999,33.094,17/300x300@2x.png?access_token=pk.eyJ1IjoibXJtYWtzaW1pemUiLCJhIjoiRlRwLWwyVSJ9.--Y4RdEJ_5ZuJjSUkx34vQ'

  switch(event.clickType) {
      case "SINGLE":
        body = "Poacher reported in Escondido area. Respond immediately";
        mediaURL = singleMedia;
        break;
      case "DOUBLE":
        body = "Poachers moving in the area. Respond Immediately";
        mediaURL = doubleMedia;
        break;
      case "LONG":
        body = "Multiple armed units detected. Notified UN Peacekeepers and local military forces."
        mediaURL = longMedia;
        break;
  }

  for (var i = 0; i < receiverNumbers.length; i++) {
      client.messages.create({
          body: body,
          to: receiverNumbers[i],  // Text this number
          from: twilio_num, // From a valid Twilio number
          mediaUrl: mediaURL
      }, function(err, message) {
          if(err) {
              console.error(err.message);
          }
      });
  }
};
