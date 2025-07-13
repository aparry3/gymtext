#!/usr/bin/env tsx
/**
 * Test script for Phase 2 implementation
 * Run with: npx tsx scripts/test-phase2.ts
 */

import { randomUUID } from 'crypto';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_USER_ID = process.env.TEST_USER_ID || randomUUID();

console.log('🧪 Testing Phase 2 Implementation');
console.log(`📍 API Base URL: ${API_BASE_URL}`);
console.log(`👤 Test User ID: ${TEST_USER_ID}`);
console.log('-----------------------------------\n');

async function makeRequest(endpoint: string, method: string = 'GET', body?: any) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`🔄 ${method} ${url}`);
  if (body) console.log('📦 Body:', JSON.stringify(body, null, 2));
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', response.status);
      console.log('📤 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:', response.status);
      console.log('📤 Response:', JSON.stringify(data, null, 2));
    }
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log('💥 Request failed:', error);
    return { success: false, error };
  }
}

async function testWorkflow() {
  console.log('\n=== TEST 1: User Onboarding with Program Generation ===\n');
  
  const onboardResult = await makeRequest('/api/agent', 'POST', {
    action: 'onboard',
    userId: TEST_USER_ID
  });
  
  if (!onboardResult.success) {
    console.log('\n⚠️  Onboarding failed. Make sure the user exists in the database.');
    return;
  }
  
  const programId = onboardResult.data?.programId;
  console.log(`\n📋 Generated Program ID: ${programId || 'Not provided'}`);
  
  // Wait a bit before next request
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n=== TEST 2: Generate Daily Workout ===\n');
  
  const workoutResult = await makeRequest('/api/workouts/daily', 'POST', {
    userId: TEST_USER_ID
  });
  
  if (!workoutResult.success) {
    console.log('\n⚠️  Daily workout generation failed.');
  }
  
  // Wait a bit before next request
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n=== TEST 3: List User Programs ===\n');
  
  await makeRequest(`/api/programs?userId=${TEST_USER_ID}`, 'GET');
  
  // Wait a bit before next request
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (programId) {
    console.log('\n=== TEST 4: Adapt Program ===\n');
    
    await makeRequest('/api/agent', 'POST', {
      action: 'adapt-program',
      userId: TEST_USER_ID,
      programId: programId,
      reason: 'I will be traveling for 2 weeks and only have access to hotel gym',
      feedback: 'The current workouts are too long, need 30-minute sessions'
    });
  }
  
  console.log('\n=== Testing Complete ===\n');
}

async function testIndividualEndpoints() {
  console.log('\n=== TESTING INDIVIDUAL ENDPOINTS ===\n');
  
  console.log('\n--- Test Program Generation ---\n');
  const programResult = await makeRequest('/api/programs/generate', 'POST', {
    userId: TEST_USER_ID,
    preferences: {
      programType: 'hypertrophy',
      duration: 8
    }
  });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (programResult.success && programResult.data?.program?.id) {
    const programId = programResult.data.program.id;
    
    console.log('\n--- Test Get Program Details ---\n');
    await makeRequest(`/api/programs/${programId}`, 'GET');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n--- Test Regenerate Week ---\n');
    await makeRequest(`/api/programs/${programId}/regenerate-week`, 'POST', {
      userId: TEST_USER_ID,
      weekNumber: 1,
      reason: 'Need easier workouts this week'
    });
  }
}

// Main execution
async function main() {
  const testType = process.argv[2] || 'workflow';
  
  if (testType === 'workflow') {
    await testWorkflow();
  } else if (testType === 'endpoints') {
    await testIndividualEndpoints();
  } else {
    console.log('Usage: npx tsx scripts/test-phase2.ts [workflow|endpoints]');
  }
}

main().catch(console.error);