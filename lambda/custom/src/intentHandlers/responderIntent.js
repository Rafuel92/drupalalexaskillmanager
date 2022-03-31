const Alexa = require('ask-sdk-core');
const config = require('../../config');
const httpGet = require('../common/httpGet');
const httpPost = require('../common/httpPost');
const authenticatedIntents = ['%placeholder%'];
const TOKEN = 'ExampleToken';
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
                console.debug(parsed);
                let needsApl = parsed.output.apl.template.length > 0;
                let elements = {type:"object"};
                for(const variable in parsed.output.apl.variables) {
                  elements[variable] = parsed.output.apl.variables[variable];
                }
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
                      if(needsApl) {
                        resolve(
                            handlerInput.responseBuilder
                                .speak(parsed.output.speak)
                                .addDirective({
                                  type: 'Alexa.Presentation.APL.RenderDocument',
                                  token: TOKEN,
                                  datasources: {
                                    elements: elements
                                  },
                                  document: JSON.parse(parsed.output.apl.template)
                                })
                                .getResponse()
                        );
                      } else {
                        resolve(
                            handlerInput.responseBuilder
                                .speak(parsed.output.speak)
                                .getResponse()
                        );
                      }
                    }
                }  else {
                  if(needsApl) {
                    resolve(
                        handlerInput.responseBuilder
                            .speak(parsed.output.speak)
                            .addDirective({
                              type: 'Alexa.Presentation.APL.RenderDocument',
                              token: TOKEN,
                              datasources: {
                                elements: elements
                              },
                              document: JSON.parse(parsed.output.apl.template)
                            })
                            .getResponse()
                    );
                  } else {
                    resolve(
                        handlerInput.responseBuilder
                            .speak(parsed.output.speak)
                            .getResponse()
                    );
                  }
                }
            });
        });
    }
};

module.exports = ResponderIntent;
