import { describe, it, expect } from 'vitest';
import { UserBuilder } from '../../../fixtures/users';
import { FitnessProfileBuilder } from '../../../fixtures/fitnessProfiles';
import { WorkoutInstanceBuilder } from '../../../fixtures/workoutInstances';
import type { UserWithProfile } from '@/server/models/userModel';

// Import all prompt functions
import { dailyMessagePrompt } from '@/server/agents/dailyMessage/prompts';
import { chatPrompt, contextPrompt, motivationalPrompt, workoutReminderPrompt } from '@/server/agents/chat/prompts';

describe('Agent Prompts', () => {
  describe('Daily Message Prompt', () => {
    it('should generate proper daily message prompt with workout details', () => {
      const user: UserWithProfile = {
        ...new UserBuilder().withName('John').build(),
        profile: new FitnessProfileBuilder()
          .withSkillLevel('intermediate')
          .withFitnessGoals('Build muscle, Increase strength')
          .build(),
      };

      const workout = new WorkoutInstanceBuilder()
        .withSessionType('strength')
        .withGoal('Upper body strength')
        .withDetails({
          sessionType: 'lift',
          details: [
            {
              label: 'Warm-up',
              activities: ['5 min rowing', 'Dynamic stretching'],
            },
            {
              label: 'Main Work',
              activities: ['Bench Press 3x8 @ 80%', 'Pull-ups 3x8'],
            },
          ],
          targets: [
            { key: 'volumeKg', value: 5000 },
            { key: 'rpe', value: 8 },
          ],
        })
        .build();

      const fitnessProfile = 'Fitness Level: intermediate, Goals: Build muscle, Experience: 3-4 times per week';

      const prompt = dailyMessagePrompt(user, fitnessProfile, workout);

      // Verify prompt structure
      expect(prompt).toContain('John');
      expect(prompt).toContain('≤ 900 chars');
      expect(prompt).toContain('DAILY SMS');
      expect(prompt).toContain(fitnessProfile);
      expect(prompt).toContain(JSON.stringify(workout));
      expect(prompt).toContain('Upper body strength');
    });

    it('should handle recovery day workouts', () => {
      const user: UserWithProfile = {
        ...new UserBuilder().withName('Sarah').build(),
        profile: new FitnessProfileBuilder().build(),
      };

      const workout = new WorkoutInstanceBuilder()
        .withSessionType('recovery')
        .withGoal('Active recovery')
        .withDetails({
          sessionType: 'other',
          details: [
            {
              label: 'Recovery',
              activities: ['Light stretching', 'Foam rolling'],
            },
          ],
        })
        .build();

      const prompt = dailyMessagePrompt(user, 'Fitness Level: beginner', workout);

      expect(prompt).toContain('Sarah');
      expect(prompt).toContain('recovery');
      expect(prompt).toContain('Light stretching');
      expect(prompt).toContain('Foam rolling');
    });
  });

  describe('Chat Prompts', () => {
    it('should generate proper chat prompt with conversation history', () => {
      const user: UserWithProfile = {
        ...new UserBuilder().withName('Mike').build(),
        profile: new FitnessProfileBuilder()
          .withSkillLevel('intermediate')
          .withFitnessGoals('Build muscle')
          .withExerciseFrequency('3-4 times per week')
          .build(),
      };

      const message = 'What should I eat before my workout?';
      const conversationHistory = [
        {
          id: '1',
          conversationId: 'conv-1',
          userId: 'user-1',
          direction: 'inbound' as const,
          content: 'I want to improve my diet',
          phoneFrom: '+1234567890',
          phoneTo: '+0987654321',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          conversationId: 'conv-1',
          userId: 'user-1',
          direction: 'outbound' as const,
          content: 'Great! Nutrition is key for fitness goals.',
          phoneFrom: '+0987654321',
          phoneTo: '+1234567890',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const context = {
        userProfile: { level: 'intermediate', goals: 'Build muscle' },
        currentProgram: { type: 'hypertrophy' },
      };

      const prompt = chatPrompt(user, message, conversationHistory, context);

      // Verify prompt includes all necessary information
      expect(prompt).toContain('Mike');
      expect(prompt).toContain('intermediate');
      expect(prompt).toContain('Build muscle');
      expect(prompt).toContain('3-4 times per week');
      expect(prompt).toContain('What should I eat before my workout?');
      expect(prompt).toContain('User: I want to improve my diet');
      expect(prompt).toContain('Assistant: Great! Nutrition is key for fitness goals.');
      expect(prompt).toContain('professional fitness coach');
      expect(prompt).toContain('under 300 words for SMS compatibility');
    });

    it('should handle missing profile gracefully', () => {
      const user = {
        ...new UserBuilder().withName('Alex').build(),
        profile: undefined
      } as any; // Force profile to be undefined
      const message = 'How do I start working out?';

      const prompt = chatPrompt(user, message, [], undefined);

      expect(prompt).toContain('Alex');
      expect(prompt).toContain('Not specified');
      expect(prompt).toContain('How do I start working out?');
    });

    it('should generate contextual prompt with rich context', () => {
      const user: UserWithProfile = {
        ...new UserBuilder().withName('Emma').build(),
        profile: new FitnessProfileBuilder().build(),
      };

      const message = 'Show me my progress';
      const context = {
        userProfile: {
          name: 'Emma',
          level: 'advanced',
          goals: 'Powerlifting competition',
        },
        workoutHistory: [
          { date: '2024-01-15', type: 'strength', completed: true },
          { date: '2024-01-14', type: 'strength', completed: true },
        ],
        currentStats: {
          squat1RM: 315,
          bench1RM: 225,
          deadlift1RM: 405,
        },
      };

      const prompt = contextPrompt(user, message, context);

      expect(prompt).toContain('Emma');
      expect(prompt).toContain('Show me my progress');
      expect(prompt).toContain(JSON.stringify(context, null, 2));
      expect(prompt).toContain('specific, helpful response');
      expect(prompt).toContain('under 200 words');
    });
  });

  describe('Motivational Prompt', () => {
    it('should generate motivational message with achievement', () => {
      const user: UserWithProfile = {
        ...new UserBuilder().withName('David').build(),
        profile: new FitnessProfileBuilder()
          .withFitnessGoals('Lose weight, Build endurance')
          .withSkillLevel('beginner')
          .build(),
      };

      const achievement = 'Completed 5 workouts this week';
      const currentStreak = 7;

      const prompt = motivationalPrompt(user, achievement, currentStreak);

      expect(prompt).toContain('David');
      expect(prompt).toContain('Lose weight, Build endurance');
      expect(prompt).toContain('beginner');
      expect(prompt).toContain('Completed 5 workouts this week');
      expect(prompt).toContain('7 days');
      expect(prompt).toContain('encouraging, personalized message');
      expect(prompt).toContain('under 150 words for SMS');
    });

    it('should handle missing achievement and streak', () => {
      const user: UserWithProfile = {
        ...new UserBuilder().withName('Lisa').build(),
        profile: new FitnessProfileBuilder().build(),
      };

      const prompt = motivationalPrompt(user);

      expect(prompt).toContain('Lisa');
      expect(prompt).not.toContain('Recent Achievement');
      expect(prompt).not.toContain('Current Streak');
    });
  });

  describe('Workout Reminder Prompt', () => {
    it('should generate reminder with workout details', () => {
      const user: UserWithProfile = {
        ...new UserBuilder().withName('Chris').build(),
        profile: new FitnessProfileBuilder().build(),
      };

      const upcomingWorkout = {
        name: 'Upper Body Strength',
        focus: 'Chest and Back',
        estimatedDuration: '60 minutes',
      };
      const timeUntilWorkout = '2 hours';

      const prompt = workoutReminderPrompt(user, upcomingWorkout, timeUntilWorkout);

      expect(prompt).toContain('Chris');
      expect(prompt).toContain('Upper Body Strength');
      expect(prompt).toContain('Chest and Back');
      expect(prompt).toContain('60 minutes');
      expect(prompt).toContain('2 hours');
      expect(prompt).toContain('under 100 words');
      expect(prompt).toContain('💪, ⏰, 🔥');
    });

    it('should handle no scheduled workout', () => {
      const user: UserWithProfile = {
        ...new UserBuilder().withName('Pat').build(),
        profile: new FitnessProfileBuilder().build(),
      };

      const prompt = workoutReminderPrompt(user);

      expect(prompt).toContain('Pat');
      expect(prompt).toContain('No specific workout scheduled');
      expect(prompt).not.toContain('Duration');
    });
  });

  describe('Prompt Edge Cases', () => {
    it('should handle very long conversation history', () => {
      const user: UserWithProfile = {
        ...new UserBuilder().build(),
        profile: new FitnessProfileBuilder().build(),
      };

      const longHistory = Array.from({ length: 20 }, (_, i) => ({
        id: `msg-${i}`,
        conversationId: 'conv-1',
        userId: 'user-1',
        direction: (i % 2 === 0 ? 'inbound' : 'outbound') as const,
        content: `Message ${i + 1}: This is a test message with some content`,
        phoneFrom: '+1234567890',
        phoneTo: '+0987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const prompt = chatPrompt(user, 'New message', longHistory);

      // Should include all messages in history
      expect(prompt).toContain('Message 1');
      expect(prompt).toContain('Message 20');
      // 10 user messages in history + 1 current message + 1 in prompt template = 12
      expect(prompt.split('User:').length).toBe(12);
      // 10 assistant messages in history
      expect(prompt.split('Assistant:').length).toBe(11); // Count includes one in the template
    });

    it('should handle complex workout details in daily message', () => {
      const user: UserWithProfile = {
        ...new UserBuilder().build(),
        profile: new FitnessProfileBuilder().build(),
      };

      const complexWorkout = new WorkoutInstanceBuilder()
        .withDetails({
          sessionType: 'lift',
          details: [
            {
              label: 'Warm-up',
              activities: ['10 min bike', 'Dynamic stretching', 'Band work'],
            },
            {
              label: 'Main Lift',
              activities: ['Squat: 5@60%, 5@70%, 5@80%, 3@85%, 1@90%, 1@95%'],
            },
            {
              label: 'Accessory A',
              activities: ['Front Squat 4x6@70%', 'Bulgarian Split Squats 3x10'],
            },
            {
              label: 'Accessory B',
              activities: ['Leg Curls 4x12', 'Calf Raises 4x15', 'Leg Press 3x20'],
            },
            {
              label: 'Core & Conditioning',
              activities: ['Plank 3x60s', 'Dead Bug 3x10', 'Sled Push 4x40m'],
            },
          ],
          targets: [
            { key: 'totalVolume', value: 15000 },
            { key: 'topSetWeight', value: 140 },
            { key: 'rpe', value: 9 },
            { key: 'sessionDuration', value: 90 },
            { key: 'caloriesBurned', value: 450 },
          ],
        })
        .build();

      const prompt = dailyMessagePrompt(user, 'Advanced lifter profile', complexWorkout);

      expect(prompt).toContain('Warm-up');
      expect(prompt).toContain('Main Lift');
      expect(prompt).toContain('Accessory A');
      expect(prompt).toContain('Accessory B');
      expect(prompt).toContain('Core & Conditioning');
      expect(prompt).toContain('15000'); // volume
      expect(prompt).toContain('140'); // top set
    });

    it('should escape special characters in user input', () => {
      const user: UserWithProfile = {
        ...new UserBuilder().withName('Test"User').build(),
        profile: new FitnessProfileBuilder()
          .withFitnessGoals('Build muscle & "get strong"')
          .build(),
      };

      const message = 'What about "special" characters & symbols?';
      
      const prompt = chatPrompt(user, message, []);

      expect(prompt).toContain('Test"User');
      expect(prompt).toContain('Build muscle & "get strong"');
      expect(prompt).toContain('What about "special" characters & symbols?');
    });
  });
});