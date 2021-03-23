/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const demo_data = require('./documents/cheeses.json');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      // If we consider the launch screen and the home screen the same, then let's have
      // the Launch Request Handler also handle the Navigate Home Intent.
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
    );
  },
  handle(handlerInput) {
    const speakOutput =
     "Welcome to our interaction demo. Please say 'cheese' or tap the 'cheese demo' button.";

   var demo_blue = require('./documents/demo_blue.json');

    // Check to make sure the device supports APL
    if (
      Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
        'Alexa.Presentation.APL'
      ]
    ) {
      // add a directive to render our simple template
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        document: demo_blue,
      });
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const demoTypeIntentHandler = {
  canHandle(handlerInput) {
    //Runs if the demoTypeIntent was invoked verbally OR if the button in the demo_blue.json document was pressed
    return (
      (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          'demoTypeIntent') ||
      (Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
        handlerInput.requestEnvelope.request.source.id === 'cheeseButton')
    );
  },
  handle(handlerInput) {
    var next_demo = 'cheese';
    var speakOutput = '';

    // load our APL and APLA documents
    var demo_doc = require(`./documents/${next_demo}DemoMain.json`);
    var intro_doc = require(`./documents/APLA_docIntro.json`);
    const doc_data = demo_data[0];

    // set the cheese we're on (numerically)
    // we'll compute this value when we get navigation commands, but
    // when you "say cheese," it's all "gouda"
    var atts = handlerInput.attributesManager.getSessionAttributes();
    atts.cheeseno = 0;

    if (
      Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
        'Alexa.Presentation.APL'
      ]
    ) {
      // add a directive to render our simple template
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'demoDoc', // we need a token so we can target future commands to this document
        document: demo_doc,
        datasources: {
          demo: {
            type: 'object',
            properties: doc_data,
          },
        },
      });
    }
    
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APLA.RenderDocument',
        document: intro_doc,
        datasources: {
          demo: {
            type: 'object',
            properties: doc_data,
          },
        },
      });

    if (!atts.beenHere) {
        speakOutput =
          'Welcome to the cheese demo. Tap a button or say next, or back to review our cheeses.';
          atts.beenHere = true;
      } else {
          speakOutput = "Welcome back to the cheese demo. Tap a button or say next, or back to review our cheeses."
      }
    
    handlerInput.attributesManager.setSessionAttributes(atts);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const nextBackIntentHandler = {
  canHandle(handlerInput) {
    //Runs if the demoTypeIntent was invoked verbally OR if the button in the demo_blue.json document was pressed
    return (
      (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          'nextBackIntent') ||
      (Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
        handlerInput.requestEnvelope.request.arguments[0] === 'cheesenext') ||
      (Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
        handlerInput.requestEnvelope.request.arguments[0] === 'cheeseback')
    );
  },
  handle(handlerInput) {
    const intro_doc = require("./documents/APLA_docIntro.json");

    // figure out the proper cheese to use and assign to doc_data
    //get direction
    var mover = 1; //if it's not backwards, it's forwards
    if((handlerInput.requestEnvelope.request.hasOwnProperty('intent') && handlerInput.requestEnvelope.request.intent.slots.direction.value === "back")
      ||(handlerInput.requestEnvelope.request.hasOwnProperty('arguments') && handlerInput.requestEnvelope.request.arguments[0] === 'cheeseback'))
    {
        mover = -1;
    }

    var atts = handlerInput.attributesManager.getSessionAttributes();
    if (atts.hasOwnProperty('cheeseno')) {
      atts.cheeseno += mover;
      if (atts.cheeseno === demo_data.length) atts.cheeseno = 0;
      if (atts.cheeseno === -1) atts.cheeseno = (demo_data.length - 1);
    } else {
      atts.cheeseno = 1;
    }

    var doc_data = demo_data[atts.cheeseno];
    handlerInput.attributesManager.setSessionAttributes(atts);

    //add command execute update
    if (
      Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
        'Alexa.Presentation.APL'
      ]
    ) {
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.ExecuteCommands',
        token: 'demoDoc',
        commands: [
          {
            type: 'SetValue',
            componentId: 'mainScreen',
            property: 'bodyText',
            value: doc_data.bodyText,
          },
          {
            type: 'SetValue',
            componentId: 'mainScreen',
            property: 'imageSource',
            value: doc_data.imageSource,
          },
          {
            type: 'SetValue',
            componentId: 'mainScreen',
            property: 'imageCaption',
            value: doc_data.imageCaption,
          },
        ],
      });
    }    
    handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APLA.RenderDocument',
        document: intro_doc,
        datasources: {
          demo: {
            type: 'object',
            properties: doc_data,
          },
        },
      });
    
    const speakOutput = "";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('speakOutput')
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const speakOutput = 'You can say hello to me! How can I help?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.FallbackIntent'
    );
  },
  handle(handlerInput) {
    const speakOutput = "Sorry, I don't know about that. Please try again.";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      'SessionEndedRequest'
    );
  },
  handle(handlerInput) {
    console.log(
      `~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  async handle(handlerInput, error) {
    if (handlerInput.requestEnvelope.request.hasOwnProperty('source'))
      console.log(
        'BUTTON CLICK: ' + handlerInput.requestEnvelope.request.arguments[0]
      );
    const speakOutput =
      'Sorry, I had trouble doing what you asked. Please try again.';
    console.log(`~~~~ Error handled: ${await JSON.stringify(error)}`);
    console.log(`~~~~ RequestEnvelope: ${await JSON.stringify(handlerInput.requestEnvelope)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    demoTypeIntentHandler,
    nextBackIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/hello-world/v1.2')
  .lambda();
