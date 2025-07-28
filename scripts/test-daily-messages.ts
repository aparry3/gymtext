#!/usr/bin/env tsx
/**
 * Test script for daily message cron endpoint
 * Usage: pnpm tsx scripts/test-daily-messages.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

async function testCronEndpoint() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('❌ CRON_SECRET not found in environment variables');
    process.exit(1);
  }
  
  console.log('🔄 Testing daily messages cron endpoint...');
  console.log(`📍 URL: ${baseUrl}/api/cron/daily-messages`);
  
  try {
    const response = await fetch(`${baseUrl}/api/cron/daily-messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Cron endpoint test successful!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Cron endpoint test failed');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error testing cron endpoint:', error);
  }
}

async function testUserPreferences() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const testUserId = process.env.TEST_USER_ID; // Add a test user ID to your env
  
  if (!testUserId) {
    console.log('⚠️  TEST_USER_ID not found, skipping user preferences test');
    return;
  }
  
  console.log('\n🔄 Testing user preferences endpoint...');
  
  // Test GET
  try {
    const getResponse = await fetch(`${baseUrl}/api/user/preferences`, {
      method: 'GET',
      headers: {
        'x-user-id': testUserId,
      },
    });
    
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ GET preferences successful!');
      console.log('📊 Current preferences:', JSON.stringify(getData, null, 2));
    } else {
      console.error('❌ GET preferences failed:', getData);
    }
  } catch (error) {
    console.error('❌ Error getting preferences:', error);
  }
  
  // Test PUT
  try {
    const putResponse = await fetch(`${baseUrl}/api/user/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testUserId,
      },
      body: JSON.stringify({
        preferredSendHour: 9,
        timezone: 'America/New_York'
      }),
    });
    
    const putData = await putResponse.json();
    
    if (putResponse.ok) {
      console.log('✅ PUT preferences successful!');
      console.log('📊 Updated preferences:', JSON.stringify(putData, null, 2));
    } else {
      console.error('❌ PUT preferences failed:', putData);
    }
  } catch (error) {
    console.error('❌ Error updating preferences:', error);
  }
}

// Run tests
(async () => {
  await testCronEndpoint();
  await testUserPreferences();
})();