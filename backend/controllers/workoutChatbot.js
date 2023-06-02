const workoutChatbotRouter = require('express').Router()

const { OpenAI } = require('langchain/llms/openai')
const { PromptTemplate } = require('langchain/prompts')
const { OPEN_API_KEY } = require('../utils/config')
const { BufferMemory } = require('langchain/memory')
const { ConversationChain } = require('langchain/chains')
const { ConversationSummaryMemory } = require('langchain/memory')
const { LLMChain } = require('langchain/chains')
const { HumanChatMessage } = require('langchain/schema')

const model = new OpenAI({ modelName: "gpt-3.5-turbo", openAIApiKey: OPEN_API_KEY, temperature: 0 })
console.log('model')
const memory = new ConversationSummaryMemory({
    memoryKey: "chat_history",
    llm: model,
  })

const prompt = new PromptTemplate({
    template: "Create a workout plan for me in the following format on one line as such:\
        '[exercise1, exercise2, ..., exerciseX-1, exerciseX]'\
        Each entry (execise) in the list should be formatted as follows:\
        open bracket exerciseName, weight, reps, sets closed bracket\
        It must contain 5-{number} exercises. This will be the format returned for all subsequent requests for workouts. Follow this format.",
        inputVariables: ["number"],
})

const chain = new LLMChain({
    llm: model,
    prompt: prompt,
    memory: memory,
})
chain.call({ number: "7" }).then(response => {/*console.log(response)*/})

workoutChatbotRouter.post('/message', async (request, response) => {
    const body = request.body
    console.log(body)
    const template = "\
                    Create a workout plan for me in the following JSON format on one line for a physically fit person: \
                    [exercise1, exercise2, ..., exerciseX-1, exerciseX] \
                    Return an array of arrays and each entry (exercise) in the array should be is a JSON object: \
                    ['exerciseName' (type string), 'weight in lbs' (type int), 'reps' (type int), 'sets' (type int)] \
                    It must contain 5-7 exercises. This will be the format returned for \
                    all subsequent requests for workouts. Follow this format.\
                    It should focus on the following {muscleGroups}\
                    "
    const prompt = new PromptTemplate({ template, inputVariables: ["muscleGroups"] })
    chain.prompt = prompt
    const res = await chain.call({ muscleGroups: body.muscleGroups })

    console.log(res)

    /*const template2 = "create one similarly for {muscleGroups2}"
    const prompt2 = new PromptTemplate({ template: template2, inputVariables: ["muscleGroups2"] })
    chain.prompt = prompt2
    const res2 = await chain.call({ muscleGroups2: "legs, specifically glutes" })
    console.log(res2)*/
    
    response
        .status(200)
        .json(res)
})

module.exports = workoutChatbotRouter
