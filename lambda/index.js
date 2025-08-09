const Alexa = require('ask-sdk-core');
const fetch = require('node-fetch');
const env = require('dotenv').config();

const OPENAI_API_KEY = env.OPENAI_API_KEY;

const AskChatGPTIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AskChatGPTIntent';
    },
    async handle(handlerInput) {
        const userQuery = Alexa.getSlotValue(handlerInput.requestEnvelope, 'query');

        if (!userQuery) {
            return handlerInput.responseBuilder
                .speak("Não entendi sua pergunta. Pode repetir?")
                .reprompt("Qual pergunta você quer fazer?")
                .getResponse();
        }

        try {
            const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "Você é um assistente útil integrado à Alexa, responda de forma clara e curta." },
                        { role: "user", content: userQuery }
                    ],
                    max_tokens: 150
                })
            });

            const data = await gptResponse.json();
            const chatAnswer = data.choices?.[0]?.message?.content || "Desculpe, não consegui responder.";

            return handlerInput.responseBuilder
                .speak(chatAnswer)
                .reprompt("Quer perguntar mais alguma coisa?")
                .getResponse();

        } catch (error) {
            console.error(error);
            return handlerInput.responseBuilder
                .speak("Houve um erro ao processar sua solicitação.")
                .getResponse();
        }
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Olá! Pode me fazer uma pergunta para o ChatGPT.")
            .reprompt("Qual pergunta você quer fazer?")
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Você pode me perguntar qualquer coisa que quiser, e eu responderei usando o ChatGPT.")
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AskChatGPTIntentHandler,
        HelpIntentHandler
    )
    .lambda();
