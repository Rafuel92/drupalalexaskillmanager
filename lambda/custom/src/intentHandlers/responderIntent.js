const Alexa = require('ask-sdk-core');
const config = require('../../config');
const httpGet = require('../common/httpGet');
const httpPost = require('../common/httpPost');
const authenticatedIntents = ['%placeholder%'];

ResponderIntent = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const receivedIntentData = handlerInput.requestEnvelope.request.intent;
        const receivedIntentName = handlerInput.requestEnvelope.request.intent.name;
        let needsAuth = false;
        if (authenticatedIntents.indexOf(receivedIntentName) > -1) {
            needsAuth = true;
        }
        return new Promise(function (resolve, reject) {
            httpPost(config.hostname, JSON.stringify(receivedIntentData), (theResult) => {
                console.log(theResult);
                const parsed = JSON.parse(theResult);
                if(needsAuth) {
                    let accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
                    if(accessToken === undefined) {
                        resolve(
                            handlerInput.responseBuilder
                                .speak("Please authenticate yourself")
                                .withLinkAccountCard()
                                .getResponse()
                        );
                    } else {
                        resolve(
                            handlerInput.responseBuilder
                                .speak(parsed.output)
                                .getResponse()
                        );
                    }
                }  else {
                    resolve(
                        handlerInput.responseBuilder
                            .speak(parsed.output)
                            .getResponse()
                    );
                }
            });
        });
    }
};

module.exports = ResponderIntent;
