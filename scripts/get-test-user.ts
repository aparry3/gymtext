#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
import { postgresDb } from '@/server/connections/postgres/postgres';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function getTestUser() {
  const db = postgresDb;
  
  try {
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('phone_number', '=', '+13392223571')
      .executeTakeFirst();
    
    if (user) {
      console.log('User ID:', user.id);
      console.log('User:', JSON.stringify(user, null, 2));
      
      // Also get fitness profile
      const profile = await db
        .selectFrom('fitness_profiles')
        .selectAll()
        .where('user_id', '=', user.id)
        .executeTakeFirst();
        
      if (profile) {
        console.log('\nFitness Profile:', JSON.stringify(profile, null, 2));
      }
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

getTestUser();