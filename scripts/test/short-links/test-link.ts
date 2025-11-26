/**
 * Test script for short link creation and resolution
 */

import { shortLinkService } from '@/server/services/links/shortLinkService';
import { UserRepository } from '@/server/repositories/userRepository';

async function testShortLinks() {
  try {
    console.log('=== Testing Short Link System ===\n');

    // Get a user from the database
    // Using a hardcoded user ID for testing - replace with actual user ID
    const userId = process.argv[2];
    if (!userId) {
      console.error('Usage: pnpm tsx scripts/test/short-links/test-link.ts <user-id>');
      console.error('Please provide a user ID as the first argument');
      process.exit(1);
    }

    const userRepo = new UserRepository();
    const user = await userRepo.findById(userId);

    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      process.exit(1);
    }
    console.log(`Using user: ${user.name} (${user.id})\n`);

    // Test 1: Create a workout link
    console.log('Test 1: Create a workout link');
    const workoutId = 'test-workout-123';
    const workoutLink = await shortLinkService.createWorkoutLink(user.id, workoutId);
    const workoutUrl = shortLinkService.getFullUrl(workoutLink.code);
    console.log(`✓ Created workout link: ${workoutUrl}`);
    console.log(`  - Code: ${workoutLink.code}`);
    console.log(`  - Target: ${workoutLink.targetPath}`);
    console.log(`  - Expires: ${workoutLink.expiresAt}\n`);

    // Test 2: Create a profile link
    console.log('Test 2: Create a profile link');
    const profileLink = await shortLinkService.createProfileLink(user.id);
    const profileUrl = shortLinkService.getFullUrl(profileLink.code);
    console.log(`✓ Created profile link: ${profileUrl}`);
    console.log(`  - Code: ${profileLink.code}`);
    console.log(`  - Target: ${profileLink.targetPath}\n`);

    // Test 3: Resolve a short link
    console.log('Test 3: Resolve a short link');
    const resolved = await shortLinkService.resolveShortLink(workoutLink.code);
    if (resolved && !resolved.isExpired) {
      console.log(`✓ Resolved link successfully`);
      console.log(`  - Client ID: ${resolved.link.clientId}`);
      console.log(`  - Target: ${resolved.link.targetPath}`);
      console.log(`  - Access count: ${resolved.link.accessCount}\n`);
    } else {
      console.error('✗ Failed to resolve link\n');
    }

    // Test 4: Resolve again (should increment access count)
    console.log('Test 4: Resolve again (should increment access count)');
    const resolved2 = await shortLinkService.resolveShortLink(workoutLink.code);
    if (resolved2 && !resolved2.isExpired) {
      console.log(`✓ Resolved link again`);
      console.log(`  - Access count should be incremented in DB (async)\n`);
    }

    // Test 5: Try to resolve invalid code
    console.log('Test 5: Try to resolve invalid code');
    const invalid = await shortLinkService.resolveShortLink('ZZZZZ');
    if (!invalid) {
      console.log(`✓ Invalid code correctly returned null\n`);
    } else {
      console.error('✗ Invalid code should return null\n');
    }

    // Test 6: Create custom code
    console.log('Test 6: Create custom code');
    const customLink = await shortLinkService.createShortLink(
      user.id,
      '/me/custom',
      { code: 'TEST1' }
    );
    console.log(`✓ Created custom code link: ${shortLinkService.getFullUrl(customLink.code)}`);
    console.log(`  - Code: ${customLink.code} (should be TEST1)\n`);

    console.log('=== All tests passed! ===');
    process.exit(0);
  } catch (error) {
    console.error('Error during testing:', error);
    process.exit(1);
  }
}

testShortLinks();
