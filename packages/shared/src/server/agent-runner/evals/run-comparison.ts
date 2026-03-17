#!/usr/bin/env node
/**
 * CLI script to run comparison eval
 *
 * Usage:
 *   tsx run-comparison.ts [--output report.md] [--edge-cases]
 */

import { runComparisonEval, formatReportMarkdown } from './comparison-eval';
import { TEST_SCENARIOS, EDGE_CASE_SCENARIOS, ALL_SCENARIOS } from './test-scenarios';
import { ServiceContainer } from '../../services/service-container';
import { createGymtextRunner } from '../runner';
import { NewChatService } from '../services/new-chat.service';
import { NewOnboardingService } from '../services/new-onboarding.service';
import { NewDailyWorkoutService } from '../services/new-daily-workout.service';
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function main() {
  const args = process.argv.slice(2);
  const outputPath = args.includes('--output')
    ? args[args.indexOf('--output') + 1]
    : join(__dirname, `comparison-report-${Date.now()}.md`);
  const includeEdgeCases = args.includes('--edge-cases');
  const scenarios = includeEdgeCases ? ALL_SCENARIOS : TEST_SCENARIOS;

  console.log(`\n🔬 Running Comparison Eval`);
  console.log(`📊 Scenarios: ${scenarios.length}`);
  console.log(`📝 Output: ${outputPath}\n`);

  // Initialize services
  console.log('🔧 Initializing services...');
  const services = new ServiceContainer();
  const runner = createGymtextRunner();

  const newServices = {
    newChat: new NewChatService(runner),
    newOnboarding: new NewOnboardingService(runner),
    newDailyWorkout: new NewDailyWorkoutService(runner),
  };

  // Run comparison
  console.log('🏃 Running scenarios...\n');
  const report = await runComparisonEval(scenarios, services, newServices);

  // Format and save report
  const markdown = formatReportMarkdown(report);
  await writeFile(outputPath, markdown, 'utf-8');

  // Print summary
  console.log('\n✅ Comparison complete!\n');
  console.log('📊 Summary:');
  console.log(`   Total scenarios: ${report.summary.totalScenarios}`);
  console.log(`   New wins: ${report.summary.newWins} (${((report.summary.newWins / report.summary.totalScenarios) * 100).toFixed(1)}%)`);
  console.log(`   Old wins: ${report.summary.oldWins} (${((report.summary.oldWins / report.summary.totalScenarios) * 100).toFixed(1)}%)`);
  console.log(`   Ties: ${report.summary.ties}`);
  console.log(`   Failures: ${report.summary.failures}\n`);
  
  if (report.summary.avgScoreOld > 0 && report.summary.avgScoreNew > 0) {
    console.log(`   Average score (old): ${report.summary.avgScoreOld.toFixed(2)}/10`);
    console.log(`   Average score (new): ${report.summary.avgScoreNew.toFixed(2)}/10`);
    console.log(`   Score improvement: ${report.summary.avgScoreDiffNew >= 0 ? '+' : ''}${report.summary.avgScoreDiffNew.toFixed(2)}\n`);
  }

  console.log(`📝 Full report saved to: ${outputPath}\n`);

  // Exit with code based on results
  if (report.summary.failures > 0) {
    console.log('⚠️  Some scenarios failed in both systems');
    process.exit(1);
  } else if (report.summary.newWins < report.summary.oldWins) {
    console.log('⚠️  Old system won more scenarios than new');
    process.exit(1);
  } else {
    console.log('✅ New system meets or exceeds old system performance');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('❌ Comparison eval failed:', error);
  process.exit(1);
});
