# Update Agent Architecture
We want to make agents configurable and composable, that way we dont need to define each new agent in code.

To do this we can pass the tools, schema, sub agents, etc to the agent params. We can also pass an model config with model, tokens, etc.

EXAMPLES:

```
const messageAgent = createAgent({
    name: 'workout-message',

    systemPrompt,
    userPrompt,

    schema: WorkoutSchema,
},
{
    model: gpt-5-nano,
    maxTokens: 20000
})

const strucutredAgent = createAgent({
    name: 'workout-json',

    systemPrompt,
    userPrompt,

    schema: WorkoutSchema,
},
{
    model: gpt-5-nano,
    maxTokens: 20000
})

const workoutAgent = createAgent({
    name: 'workout',

    systemPrompt,
    userPrompt,
    context: [fitnessProfileContext, previousWorkoutsContext, dailyOverviewContext]

    subAgents: [{structured: structuredAgent, message: messageAgent}]
})

```
const conversationAgent = createAgent({
    name: 'conversation',

    systemPrompt,
    userPrompt,
    context: [fitnessProfileContext, fitnessPlanContext, todaysWorkoutContext]
    
    tools: [updateProfileTool, modificationsTool, getWorkoutTool],
},
{
    model: gpt-5.1,
    maxTokens: ...
})
```

## NAME
The name is a string that can be used in logs and identify operations

## SYSTEM PROMPT
The agent sinstructions

## USER PROMPT
The chat message

## CONTEXT
An array of context messages to add to the model invoke array
i.e.
[SYSTEM, ...CONTEXT, USER]

## TOOLS
A List of tools availble to the agent

## SCHEMA
The optional strucutred output of the agent. If the param is null/undefined, the agent returns a string

## SUBAGENTS
An array of objects/records/maps. Objects with multiple entries will run in parallel. The objects themselves run in sequence

The property name of the subagent is the field added to the reponse chain

The main chain response is returned as "response" property


So for example
```
const workoutAgent = createAgent({
    name: 'workout',

    systemPrompt,
    userPrompt,
    context: [fitnessProfileContext, previousWorkoutsContext, dailyOverviewContext]

    subAgents: [{structured: structuredAgent, message: messageAgent}, {second: secondChain}]
})
```

Would run, main model, then strucutred and message in parallel, then second. The repsonse from the main agent gets passed to the followup agent, the response, message, and strucutred get passed to the second agent, and the whole/main agent response would be:

{
    response: string,
    strucutred: <schema>
    message: string,
    second: ...
}