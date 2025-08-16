#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';
import { TestDatabase } from '../../utils/db';
import { TestConfig } from '../../utils/config';
import { Timer, formatDuration, success, error, warning, info, displayHeader } from '../../utils/common';

interface ScheduleTestOptions {
  userId?: string;
  phone?: string;
  hour?: number;
  timezone?: string;
  date?: string;
  simulate?: boolean;
  verbose: boolean;
  json?: boolean;
}

interface UserSchedule {
  userId: string;
  userName?: string;
  phone: string;
  timezone: string;
  preferredHour: number;
  localTime: string;
  utcTime: string;
  nextScheduled: Date;
  isActive: boolean;
}

interface TimezoneDistribution {
  timezone: string;
  userCount: number;
  percentage: number;
  peakHours: number[];
}

interface HourDistribution {
  hour: number;
  userCount: number;
  timezones: string[];
}

class ScheduleTester {
  private db: TestDatabase;
  private config: TestConfig;
  private timer: Timer;

  constructor() {
    this.db = TestDatabase.getInstance();
    this.config = TestConfig.getInstance();
    this.timer = new Timer();
  }

  /**
   * Get user schedule information
   */
  private async getUserSchedule(userId: string): Promise<UserSchedule | null> {
    const user = await this.db.getUserWithProfile(userId);
    if (!user) {
      return null;
    }

    const timezone = user.timezone || 'America/New_York';
    const preferredHour = user.preferredSendHour || 8;
    
    // Calculate local and UTC times
    const now = new Date();
    const userLocalTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const localHour = preferredHour;
    const utcOffset = this.getUTCOffset(timezone);
    const utcHour = (localHour - utcOffset + 24) % 24;
    
    // Calculate next scheduled time
    const nextScheduled = new Date();
    nextScheduled.setUTCHours(utcHour, 0, 0, 0);
    if (nextScheduled <= now) {
      nextScheduled.setDate(nextScheduled.getDate() + 1);
    }

    return {
      userId: user.id!,
      userName: user.name || undefined,
      phone: user.phoneNumber,
      timezone,
      preferredHour: localHour,
      localTime: `${localHour.toString().padStart(2, '0')}:00`,
      utcTime: `${utcHour.toString().padStart(2, '0')}:00`,
      nextScheduled,
      isActive: true, // Assuming active if they have a schedule
    };
  }

  /**
   * Get UTC offset for a timezone
   */
  private getUTCOffset(timezone: string): number {
    const now = new Date();
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    return Math.round((tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60));
  }

  /**
   * Get all users scheduled for a specific UTC hour
   */
  private async getUsersForUTCHour(hour: number): Promise<UserSchedule[]> {
    const users = await this.db.getUsersForHour(hour);
    const schedules: UserSchedule[] = [];

    for (const user of users) {
      const schedule = await this.getUserSchedule(user.id);
      if (schedule) {
        schedules.push(schedule);
      }
    }

    return schedules;
  }

  /**
   * Analyze timezone distribution
   */
  private async analyzeTimezoneDistribution(): Promise<TimezoneDistribution[]> {
    const users = await this.db.getActiveUsers();
    const timezoneMap = new Map<string, { count: number; hours: Set<number> }>();

    for (const user of users) {
      const schedule = await this.getUserSchedule(user.id);
      if (schedule) {
        const tz = schedule.timezone;
        if (!timezoneMap.has(tz)) {
          timezoneMap.set(tz, { count: 0, hours: new Set() });
        }
        const data = timezoneMap.get(tz)!;
        data.count++;
        data.hours.add(schedule.preferredHour);
      }
    }

    const total = users.length;
    const distribution: TimezoneDistribution[] = [];

    for (const [timezone, data] of timezoneMap) {
      distribution.push({
        timezone,
        userCount: data.count,
        percentage: (data.count / total) * 100,
        peakHours: Array.from(data.hours).sort((a, b) => a - b),
      });
    }

    return distribution.sort((a, b) => b.userCount - a.userCount);
  }

  /**
   * Analyze hour distribution (UTC)
   */
  private async analyzeHourDistribution(): Promise<HourDistribution[]> {
    const distribution: HourDistribution[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const users = await this.getUsersForUTCHour(hour);
      if (users.length > 0) {
        const timezones = [...new Set(users.map(u => u.timezone))];
        distribution.push({
          hour,
          userCount: users.length,
          timezones,
        });
      }
    }

    return distribution;
  }

  /**
   * Display user schedule
   */
  private displayUserSchedule(schedule: UserSchedule): void {
    displayHeader('User Schedule Information');

    const data = [
      ['Field', 'Value'],
      ['User', schedule.userName || schedule.userId],
      ['Phone', schedule.phone],
      ['Status', schedule.isActive ? chalk.green('Active') : chalk.gray('Inactive')],
      ['Timezone', schedule.timezone],
      ['Preferred Time', `${schedule.localTime} local`],
      ['UTC Time', `${schedule.utcTime} UTC`],
      ['Next Scheduled', schedule.nextScheduled.toLocaleString()],
    ];

    console.log(table(data));
  }

  /**
   * Display timezone distribution
   */
  private displayTimezoneDistribution(distribution: TimezoneDistribution[]): void {
    displayHeader('Timezone Distribution');

    const data = [
      ['Timezone', 'Users', '%', 'Peak Hours (Local)'],
      ...distribution.map(d => [
        d.timezone,
        d.userCount.toString(),
        `${d.percentage.toFixed(1)}%`,
        d.peakHours.map(h => `${h}:00`).join(', '),
      ]),
    ];

    console.log(table(data));
  }

  /**
   * Display hour distribution
   */
  private displayHourDistribution(distribution: HourDistribution[]): void {
    displayHeader('UTC Hour Distribution');

    const data = [
      ['Hour (UTC)', 'Users', 'Timezones'],
      ...distribution.map(d => [
        `${d.hour.toString().padStart(2, '0')}:00`,
        d.userCount.toString(),
        d.timezones.slice(0, 3).join(', ') + (d.timezones.length > 3 ? '...' : ''),
      ]),
    ];

    console.log(table(data));

    // Show peak hours
    const peakHours = distribution.sort((a, b) => b.userCount - a.userCount).slice(0, 5);
    console.log(chalk.cyan('\nPeak Hours (UTC):'));
    peakHours.forEach(h => {
      console.log(chalk.green(`  ${h.hour.toString().padStart(2, '0')}:00 - ${h.userCount} users`));
    });
  }

  /**
   * Simulate schedule for a specific date
   */
  private async simulateSchedule(date: Date): Promise<void> {
    displayHeader(`Schedule Simulation for ${date.toDateString()}`);

    const hourlySchedule: { hour: number; users: UserSchedule[] }[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const users = await this.getUsersForUTCHour(hour);
      if (users.length > 0) {
        hourlySchedule.push({ hour, users });
      }
    }

    if (hourlySchedule.length === 0) {
      warning('No users scheduled for this date');
      return;
    }

    console.log(chalk.cyan('Hourly Schedule (UTC):'));
    hourlySchedule.forEach(({ hour, users }) => {
      console.log(chalk.blue(`\n${hour.toString().padStart(2, '0')}:00 UTC (${users.length} users):`));
      
      // Group by timezone
      const byTimezone = new Map<string, UserSchedule[]>();
      users.forEach(u => {
        if (!byTimezone.has(u.timezone)) {
          byTimezone.set(u.timezone, []);
        }
        byTimezone.get(u.timezone)!.push(u);
      });

      byTimezone.forEach((tzUsers, tz) => {
        const localHour = tzUsers[0].preferredHour;
        console.log(chalk.gray(`  ${tz} (${localHour}:00 local): ${tzUsers.length} users`));
      });
    });

    // Summary
    const totalUsers = hourlySchedule.reduce((sum, h) => sum + h.users.length, 0);
    console.log(chalk.green(`\nTotal scheduled messages: ${totalUsers}`));
  }

  /**
   * Test user schedule
   */
  async testUserSchedule(options: ScheduleTestOptions): Promise<void> {
    this.timer.start();

    let userId: string | undefined;

    if (options.userId) {
      userId = options.userId;
    } else if (options.phone) {
      const user = await this.db.getUserByPhone(options.phone);
      if (!user) {
        throw new Error(`User with phone ${options.phone} not found`);
      }
      userId = user.id;
    } else {
      throw new Error('Either --user-id or --phone must be provided');
    }

    const schedule = await this.getUserSchedule(userId);
    if (!schedule) {
      throw new Error(`User ${userId} not found`);
    }

    if (options.json) {
      console.log(JSON.stringify(schedule, null, 2));
    } else {
      this.displayUserSchedule(schedule);
      
      // Test if user would receive message at specific hour
      if (options.hour !== undefined) {
        const utcHour = parseInt(schedule.utcTime.split(':')[0]);
        if (utcHour === options.hour) {
          success(`User WOULD receive message at ${options.hour}:00 UTC`);
        } else {
          warning(`User would NOT receive message at ${options.hour}:00 UTC`);
          info(`User is scheduled for ${utcHour}:00 UTC`);
        }
      }

      console.log(chalk.gray(`\nCompleted in ${formatDuration(this.timer.elapsed())}`));
    }
  }

  /**
   * Test hour schedule
   */
  async testHourSchedule(hour: number, options: ScheduleTestOptions): Promise<void> {
    this.timer.start();

    const users = await this.getUsersForUTCHour(hour);

    if (options.json) {
      console.log(JSON.stringify(users, null, 2));
    } else {
      displayHeader(`Users Scheduled for ${hour}:00 UTC`);

      if (users.length === 0) {
        warning('No users scheduled for this hour');
      } else {
        const data = [
          ['User', 'Phone', 'Timezone', 'Local Time', 'Status'],
          ...users.map(u => [
            u.userName || u.userId.substring(0, 8),
            u.phone.substring(0, 10) + '...',
            u.timezone,
            u.localTime,
            u.isActive ? chalk.green('Active') : chalk.gray('Inactive'),
          ]),
        ];

        console.log(table(data));
        success(`Found ${users.length} users scheduled for ${hour}:00 UTC`);
      }

      console.log(chalk.gray(`\nCompleted in ${formatDuration(this.timer.elapsed())}`));
    }
  }

  /**
   * Analyze all schedules
   */
  async analyzeSchedules(options: ScheduleTestOptions): Promise<void> {
    this.timer.start();

    if (options.json) {
      const timezoneDistribution = await this.analyzeTimezoneDistribution();
      const hourDistribution = await this.analyzeHourDistribution();
      
      console.log(JSON.stringify({
        timezoneDistribution,
        hourDistribution,
      }, null, 2));
    } else {
      displayHeader('Schedule Analysis');

      // Timezone distribution
      const timezoneDistribution = await this.analyzeTimezoneDistribution();
      this.displayTimezoneDistribution(timezoneDistribution);

      // Hour distribution
      const hourDistribution = await this.analyzeHourDistribution();
      this.displayHourDistribution(hourDistribution);

      // Simulate if requested
      if (options.simulate) {
        const simulateDate = options.date ? new Date(options.date) : new Date();
        await this.simulateSchedule(simulateDate);
      }

      console.log(chalk.gray(`\nCompleted in ${formatDuration(this.timer.elapsed())}`));
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    await this.db.close();
  }
}

/**
 * Main CLI
 */
const program = new Command();

program
  .name('test-messages-schedule')
  .description('Test message scheduling logic and timezone handling')
  .version('1.0.0')
  .option('-u, --user-id <id>', 'Test schedule for specific user ID')
  .option('-p, --phone <phone>', 'Test schedule for user with phone number')
  .option('-H, --hour <hour>', 'Test specific UTC hour (0-23)', parseInt)
  .option('-t, --timezone <timezone>', 'Filter by timezone')
  .option('-d, --date <date>', 'Test schedule for specific date (ISO format)')
  .option('-s, --simulate', 'Simulate full day schedule')
  .option('-v, --verbose', 'Show detailed output', false)
  .option('-j, --json', 'Output results as JSON', false)
  .action(async (options: ScheduleTestOptions) => {
    const tester = new ScheduleTester();

    try {
      if (options.userId || options.phone) {
        // Test specific user schedule
        await tester.testUserSchedule(options);
      } else if (options.hour !== undefined) {
        // Test specific hour
        await tester.testHourSchedule(options.hour, options);
      } else {
        // Analyze all schedules
        await tester.analyzeSchedules(options);
      }
    } catch (err) {
      if (options.json) {
        console.log(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      } else {
        error(`Test failed: ${err instanceof Error ? err.message : String(err)}`);
      }
      process.exit(1);
    } finally {
      await tester.cleanup();
    }
  });

// Show help if no arguments
if (process.argv.length === 2) {
  program.outputHelp();
  console.log(chalk.gray('\nExamples:'));
  console.log(chalk.gray('  # Test user schedule'));
  console.log('  $ pnpm test:messages:schedule --phone "+1234567890"');
  console.log();
  console.log(chalk.gray('  # Test who receives messages at specific hour'));
  console.log('  $ pnpm test:messages:schedule --hour 14');
  console.log();
  console.log(chalk.gray('  # Analyze all schedules with simulation'));
  console.log('  $ pnpm test:messages:schedule --simulate');
  console.log();
  console.log(chalk.gray('  # Simulate schedule for specific date'));
  console.log('  $ pnpm test:messages:schedule --simulate --date "2024-01-15"');
  console.log();
  console.log(chalk.gray('  # Check if user gets message at specific hour'));
  console.log('  $ pnpm test:messages:schedule --phone "+1234567890" --hour 8');
  console.log();
  console.log(chalk.gray('  # Output as JSON for automation'));
  console.log('  $ pnpm test:messages:schedule --json');
}

program.parse(process.argv);