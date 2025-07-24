import type { 
  Mesocycles, 
  JsonValue,
  DB
} from '@/server/models/_types';
import { UserWithProfile } from '../models/userModel';
import { FitnessPlan } from '../models/fitnessPlan';
import { mesocycleAgent } from '../agents/mesocycleBreakdown/chain';
import { DetailedMesocycle, MesocycleModel } from '../models/mesocycle';
import { MesocycleRepository } from '../repositories/mesocycleRepository';
import { WorkoutInstanceRepository } from '../repositories/workoutInstanceRepository';
import { MicrocycleRepository } from '../repositories/microcycleRepository';
import { MicrocycleModel } from '../models/microcycle';
import { WorkoutInstanceBreakdown, WorkoutInstanceModel } from '../models/workout';

export class MesocycleService {
  private mesocycleRepo: MesocycleRepository;
  private microcycleRepo: MicrocycleRepository;
  private workoutInstanceRepo: WorkoutInstanceRepository;

  constructor(
  ) {
    this.mesocycleRepo = new MesocycleRepository();
    this.microcycleRepo = new MicrocycleRepository();
    this.workoutInstanceRepo = new WorkoutInstanceRepository();
  }

  public async getNextMesocycle(user: UserWithProfile, fitnessPlan: FitnessPlan): Promise<DetailedMesocycle> {
    if (!fitnessPlan.macrocycles.length || !fitnessPlan.macrocycles[0].mesocycles.length) {
      throw new Error('Fitness plan does not have any mesocycles');
    }
    if (!fitnessPlan.id ) {
      throw new Error('Fitness plan does not have an id');
    }
    const macrocycle = fitnessPlan.macrocycles[0];

    const mesocycles = await this.mesocycleRepo.getMesocyclesByFitnessPlanId(fitnessPlan.id);
    const nextMesocycleIndex = mesocycles.length;

    const mesocycleOverview = macrocycle.mesocycles[nextMesocycleIndex];
    const _mesocycle = MesocycleModel.fromOverview(user, fitnessPlan, mesocycleOverview);
    const mesocycle = await this.mesocycleRepo.create(_mesocycle);

    const mesocycleAgentResponse = await mesocycleAgent.invoke({ user, context: { mesocycleOverview, fitnessPlan } });

    const microcyclesWithIds = await Promise.all(mesocycleAgentResponse.value.map(async (microcycleBreakdown) => {
      const newMicrocycle = MicrocycleModel.fromLLM(user, fitnessPlan, mesocycle, microcycleBreakdown);
      const microcycle = await this.microcycleRepo.create(newMicrocycle);
      const workouts = microcycleBreakdown.workouts.map((workoutBreakdown: WorkoutInstanceBreakdown) => {
        const newWorkout = WorkoutInstanceModel.fromLLM(user, fitnessPlan, mesocycle, microcycle, workoutBreakdown);
        return this.workoutInstanceRepo.create(newWorkout);
      })
      await Promise.all(workouts);
      return {
        ...microcycle,
        clientId: user.id,
        mesocycleId: mesocycle.id,
      }
    }))
    return {...mesocycle, microcycles: microcyclesWithIds};
  }
}