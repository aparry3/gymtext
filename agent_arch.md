We need to re-organize the agent architecutre a little bit.


Currently we have a bit too much circular dependency between services and agents                                                        

What we should do instead is create a layer of services called AgetnServices


AgentServices will handle instantiating agents, fetching context etc. The agent files themselves should be exclusively configuration. We      
want to strip out as much logic as possible from the agent file to the agent service 

heres a thought on how it might look:

workoutAgentService.ts

  ``
  export class WorkoutAgentService {
    private static instance: WorkoutAgentService;
    createWorkout(user) {
      const wokroutContext = contextService.getContext(user, ['fitness_profile', 'workout_overview', 'experience_level'], {snippet: SnippetType.WORKOUT, day: 'MONDAY'})
      const workoutAgent = createWorkoutAgent({context: workoutContext})
      cont result = await workoutAgent.invoke()
      ...
    }
  }
  ```

  agents/training/workouts/agents/generate.ts

  ```
  const createWorkoutAgent = () => {

  return agent.invoke('Generate the detailed workout for this day.') as Promise<WorkoutGenerateOutput>;

  ```

  Perhaps the createAgent funciton should return a function that takes a params object
  {
    context?: string[],
    previousMessages?: Message[],
  }

  and invoke takes and optional string


  some agetns are system only - if.e. workout generator, whereas some are user called - ie: chat agent meaning it takes a user message, whereas the workout genereator agent does not
