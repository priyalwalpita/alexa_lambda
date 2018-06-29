var http = require('http');


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `SessionSpeechlet - ${title}`,
            content: `SessionSpeechlet - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}
function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);
// Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

function getWelcomeResponse(callback) {
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to the Friday Tech talk demo' ;
   
    const repromptText = 'Hey priyal : which light should I control ?' ;
    const shouldEndSession = false;
callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);
const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;
// Dispatch to your skill's intent handlers
    if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent') {
        handleSessionEndRequest(callback);
    } else if (intentName === 'lights') {
        var color = intent.slots.color.value;
        var lightstatus = intent.slots.lightstatus.value;
        lights(callback,color,lightstatus);
    } else if (intentName === 'securelight') {
        securelight(callback);
    } 
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for using Friday Tech talk demo, have a nice week end!';
    const shouldEndSession = true;
callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}



function lights(callback,color,lightstatus) {
    
   var _switch = "";
   var _status = "";
   
   if(color == "red")
        _switch = "V1";
   else if(color == "green")
        _switch = "V2";
   else if(color == "orange")
        _switch = "V0";
   else
        _switch = "error";
        
    if(lightstatus == "on")
        _status = "1";
    else if(lightstatus == "off")
        _status = "0";
    
   var endpoint = "http://13.232.30.228:8080/ad05422526054585af9097a984f0177f/update/"+_switch+"?value="+_status;
            var status ="offline";
            var body = "";
            http.get(endpoint, (response) => {
              console.log("Got response: " + response.statusCode)
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
              })
            });
   
    const sessionAttributes = {};
    
    //Get card title from data
    const cardTitle = 'device status';
    
    //Get output from data
    const speechOutput = 'The  ' + color + '  light is turned '+ lightstatus;
    const repromptText = '' ;
    const shouldEndSession = false;
callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


function securelight(callback) {
   
    const sessionAttributes = {};
    
    //Get card title from data
    const cardTitle = 'device status';
    
    //Get output from data
    const speechOutput = 'The hood light is switched off ';
    const repromptText = '' ;
    const shouldEndSession = false;
callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}



function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}

exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);


if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }
if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
