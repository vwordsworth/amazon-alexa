/**
  Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.fe7c78e4-41fa-4030-93aa-2561ec38fc2f"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var http = require('http');

var InsideTemp = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
InsideTemp.prototype = Object.create(AlexaSkill.prototype);
InsideTemp.prototype.constructor = InsideTemp;

InsideTemp.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("InsideTemp onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

InsideTemp.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("InsideTemp onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the TLP Skills kit! The TLP rocks... and rules. You can request greenhouse temperature information.";
    var repromptText = "You can request the greenhouse temperature information.";
    response.ask(speechOutput, repromptText);
};

InsideTemp.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("InsideTemp onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

InsideTemp.prototype.intentHandlers = {
    // register custom intent handlers
    //tell --> say something to user, then end session (card pertains to Alexa companion app)
    //ask --> say something to user, keep session open

    "InsideTempIntent": function (intent, session, response) {
        getFinalTempInfo('1', response);
    },
    "OutsideTempIntent": function (intent, session, response) {
        getFinalTempInfo('2', response);
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can ask for either the inside or the outside temperature by saying the phrase: what is the inside temperature, or by saying the phrase: what is the outside temperature.", "You can ask for either temperature.");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var insideTemp = new InsideTemp();
    insideTemp.execute(event, context);
};

function makeTempRequest(loc, tempResponseCallback) {
   var endpoint = 'http://128.143.6.170/tlp2018/vkw4pd/get_temps.php';
   var queryString = '?loc=' + loc;   

   var req = http.get( endpoint + queryString , function(response) {
      console.log("Status Code: " + response.statusCode);
      var str = '';

      response.on('data', function ( chunk )  {
         str += chunk;
      });

      response.on('end', function () {
         console.log(req.data);
         console.log(str);
         //str should just be the requested number
         //code here to use the results in some way
         tempResponseCallback(null, str);     
      });
   });
   
}
    
function getFinalTempInfo(loc, response) {

   makeTempRequest( loc , function tempResponseCallback(err , tempResponse) {
      var speechOutput;
      
      if( err ) {
         speechOutput = "Sorry, the database cannot be accessed right now. Please try again later.";
      } else {
         var sens_type;
         if( loc == '1' ) {
            sens_type = "inside";
         } else {
            sens_type = "outside";
         }
         speechOutput = "The latest temperature " + sens_type + " the greenhouse is " + tempResponse + " degrees Celsius."; 
      }
      
      response.tellWithCard( speechOutput, "TLP Info" , speechOutput );
});

}




