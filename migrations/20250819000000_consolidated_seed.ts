import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

export async function up(db: Kysely<DB>): Promise<void> {
  // Create necessary extensions
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);
  
  // Create the updated_at trigger function
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // =======================
  // 1. USERS TABLE
  // =======================
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('phone_number', 'varchar(20)', (col) => col.notNull().unique())
    .addColumn('email', 'varchar(255)', (col) => col.unique())
    .addColumn('stripe_customer_id', 'varchar(255)', (col) => col.unique())
    .addColumn('preferred_send_hour', 'integer', (col) => col.defaultTo(8).notNull())
    .addColumn('timezone', 'varchar(50)', (col) => col.defaultTo('America/New_York').notNull())
    .addColumn('profile', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Add check constraint for preferred_send_hour
  await sql`
    ALTER TABLE users 
    ADD CONSTRAINT check_preferred_send_hour 
    CHECK (preferred_send_hour >= 0 AND preferred_send_hour <= 23)
  `.execute(db);

  // Create trigger for users updated_at
  await sql`
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // =======================
  // 2. PROFILE UPDATES TABLE
  // =======================
  await db.schema
    .createTable('profile_updates')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('patch', 'jsonb', (col) => col.notNull())
    .addColumn('path', 'text')
    .addColumn('source', 'text', (col) => col.notNull())
    .addColumn('reason', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // =======================
  // 3. SUBSCRIPTIONS TABLE
  // =======================
  await db.schema
    .createTable('subscriptions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('stripe_subscription_id', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('status', 'varchar(50)', (col) => col.notNull())
    .addColumn('plan_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('current_period_start', 'timestamptz', (col) => col.notNull())
    .addColumn('current_period_end', 'timestamptz', (col) => col.notNull())
    .addColumn('canceled_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create trigger for subscriptions updated_at
  await sql`
    CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // =======================
  // 4. CONVERSATIONS TABLE
  // =======================
  await db.schema
    .createTable('conversations')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('started_at', 'timestamptz', (col) => col.notNull())
    .addColumn('last_message_at', 'timestamptz', (col) => col.notNull())
    .addColumn('status', 'varchar(20)', (col) => 
      col.notNull().defaultTo('active').check(sql`status IN ('active', 'inactive', 'archived')`)
    )
    .addColumn('message_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('metadata', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .addColumn('summary', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Create trigger for conversations updated_at
  await sql`
    CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // =======================
  // 5. MESSAGES TABLE
  // =======================
  await db.schema
    .createTable('messages')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('conversation_id', 'uuid', (col) => 
      col.references('conversations.id').onDelete('cascade').notNull()
    )
    .addColumn('user_id', 'uuid', (col) => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('direction', 'varchar(10)', (col) => 
      col.notNull().check(sql`direction IN ('inbound', 'outbound')`)
    )
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('phone_from', 'varchar(20)', (col) => col.notNull())
    .addColumn('phone_to', 'varchar(20)', (col) => col.notNull())
    .addColumn('twilio_message_sid', 'varchar(100)')
    .addColumn('metadata', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // =======================
  // 6. CONVERSATION TOPICS TABLE
  // =======================
  await db.schema
    .createTable('conversation_topics')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('conversation_id', 'uuid', (col) => 
      col.references('conversations.id').onDelete('cascade').notNull()
    )
    .addColumn('topic', 'varchar(100)', (col) => col.notNull())
    .addColumn('confidence', 'real', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // =======================
  // 7. FITNESS PLANS TABLE
  // =======================
  await db.schema
    .createTable('fitness_plans')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('program_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('goal_statement', 'text')
    .addColumn('overview', 'text')
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('mesocycles', 'json')
    .addColumn('length_weeks', 'integer')
    .addColumn('notes', 'text')
    .addColumn('current_mesocycle_index', 'integer', (col) => col.defaultTo(0))
    .addColumn('current_microcycle_week', 'integer', (col) => col.defaultTo(1))
    .addColumn('cycle_start_date', 'timestamp')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Add check constraint for program_type
  await sql`
    ALTER TABLE fitness_plans 
    ADD CONSTRAINT check_program_type 
    CHECK (program_type IN ('endurance', 'strength', 'shred', 'hybrid', 'rehab', 'other'))
  `.execute(db);

  // Create trigger for fitness_plans updated_at
  await sql`
    CREATE TRIGGER update_fitness_plans_updated_at
    BEFORE UPDATE ON fitness_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // =======================
  // 8. MICROCYCLES TABLE
  // =======================
  await db.schema
    .createTable('microcycles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('fitness_plan_id', 'uuid', (col) => col.notNull().references('fitness_plans.id').onDelete('cascade'))
    .addColumn('mesocycle_index', 'integer', (col) => col.notNull())
    .addColumn('week_number', 'integer', (col) => col.notNull())
    .addColumn('pattern', 'json', (col) => col.notNull())
    .addColumn('start_date', 'timestamp', (col) => col.notNull())
    .addColumn('end_date', 'timestamp', (col) => col.notNull())
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  // Create trigger for microcycles updated_at
  await sql`
    CREATE TRIGGER update_microcycles_updated_at
    BEFORE UPDATE ON microcycles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // =======================
  // 9. WORKOUT INSTANCES TABLE
  // =======================
  await db.schema
    .createTable('workout_instances')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('fitness_plan_id', 'uuid', (col) => col.notNull().references('fitness_plans.id').onDelete('cascade'))
    .addColumn('mesocycle_id', 'uuid')
    .addColumn('microcycle_id', 'uuid')
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('session_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('goal', 'text')
    .addColumn('details', 'jsonb', (col) => col.notNull())
    .addColumn('completed_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Add check constraint for session_type
  await sql`
    ALTER TABLE workout_instances 
    ADD CONSTRAINT check_session_type 
    CHECK (session_type IN ('strength', 'cardio', 'mobility', 'recovery', 'assessment', 'deload'))
  `.execute(db);

  // Create trigger for workout_instances updated_at
  await sql`
    CREATE TRIGGER update_workout_instances_updated_at
    BEFORE UPDATE ON workout_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // =======================
  // 10. ADMIN ACTIVITY LOGS TABLE
  // =======================
  await db.schema
    .createTable('admin_activity_logs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('actor_user_id', 'uuid')
    .addColumn('target_user_id', 'uuid', (col) => col.notNull())
    .addColumn('action', 'text', (col) => col.notNull())
    .addColumn('payload', 'jsonb', (col) => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('result', 'text', (col) => col.notNull())
    .addColumn('error_message', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // =======================
  // CREATE ALL INDEXES
  // =======================
  
  // Users indexes
  await db.schema
    .createIndex('idx_users_stripe_customer_id')
    .on('users')
    .column('stripe_customer_id')
    .execute();
  
  await db.schema
    .createIndex('idx_users_send_hour')
    .on('users')
    .column('preferred_send_hour')
    .execute();

  await db.schema
    .createIndex('idx_users_timezone')
    .on('users')
    .column('timezone')
    .execute();

  // Profile updates indexes
  await db.schema
    .createIndex('idx_profile_updates_user_id')
    .on('profile_updates')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_profile_updates_created_at')
    .on('profile_updates')
    .column('created_at')
    .execute();

  // Subscriptions indexes
  await db.schema
    .createIndex('idx_subscriptions_user_id')
    .on('subscriptions')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_subscriptions_stripe_subscription_id')
    .on('subscriptions')
    .column('stripe_subscription_id')
    .execute();

  // Conversations indexes
  await db.schema
    .createIndex('idx_conversations_user_id')
    .on('conversations')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_conversations_last_message_at')
    .on('conversations')
    .column('last_message_at')
    .using('btree')
    .execute();

  await db.schema
    .createIndex('idx_conversations_status')
    .on('conversations')
    .column('status')
    .where('status', '=', 'active')
    .execute();

  // Messages indexes
  await db.schema
    .createIndex('idx_messages_conversation_id')
    .on('messages')
    .column('conversation_id')
    .execute();

  await db.schema
    .createIndex('idx_messages_created_at')
    .on('messages')
    .column('created_at')
    .using('btree')
    .execute();

  await db.schema
    .createIndex('idx_messages_user_id_created_at')
    .on('messages')
    .columns(['user_id', 'created_at'])
    .execute();

  // Conversation topics indexes
  await db.schema
    .createIndex('idx_conversation_topics_conversation_id')
    .on('conversation_topics')
    .column('conversation_id')
    .execute();

  await db.schema
    .createIndex('idx_conversation_topics_topic')
    .on('conversation_topics')
    .columns(['topic', 'confidence'])
    .execute();

  // Fitness plans indexes
  await db.schema
    .createIndex('idx_fitness_plans_client')
    .on('fitness_plans')
    .columns(['client_id', 'start_date'])
    .execute();

  await db.schema
    .createIndex('idx_fitness_plans_client_fitness')
    .on('fitness_plans')
    .column('client_id')
    .execute();

  // Microcycles indexes
  await db.schema
    .createIndex('microcycles_unique_week')
    .on('microcycles')
    .columns(['user_id', 'fitness_plan_id', 'mesocycle_index', 'week_number'])
    .unique()
    .execute();
  
  await db.schema
    .createIndex('microcycles_active_user')
    .on('microcycles')
    .columns(['user_id', 'is_active'])
    .execute();

  // Workout instances indexes
  await db.schema
    .createIndex('idx_workout_instances_daily')
    .on('workout_instances')
    .columns(['client_id', 'date'])
    .execute();

  await db.schema
    .createIndex('idx_workout_instances_microcycle')
    .on('workout_instances')
    .columns(['microcycle_id', 'date'])
    .execute();

  // Add unique constraint for workout_instances
  await sql`
    ALTER TABLE workout_instances
    ADD CONSTRAINT unique_workout_instance_daily_session
    UNIQUE (client_id, date, session_type)
  `.execute(db);

  // Admin activity logs indexes
  await db.schema
    .createIndex('idx_admin_activity_logs_target')
    .on('admin_activity_logs')
    .column('target_user_id')
    .execute();

  await db.schema
    .createIndex('idx_admin_activity_logs_created_at')
    .on('admin_activity_logs')
    .column('created_at')
    .execute();

  // =======================
  // PERFORMANCE INDEXES (from 20250813_add_performance_indexes.ts)
  // =======================
  
  // Composite index for fitness plans (most common query pattern)
  await db.schema
    .createIndex('idx_fitness_plans_user_active')
    .on('fitness_plans')
    .columns(['client_id', 'current_mesocycle_index'])
    .where('current_mesocycle_index', 'is not', null)
    .execute();

  // Composite index for recent conversations
  await db.schema
    .createIndex('idx_conversations_user_active_recent')
    .on('conversations')
    .columns(['user_id', 'status', 'last_message_at'])
    .where('status', '=', 'active')
    .execute();

  // Index for recent message lookups
  await db.schema
    .createIndex('idx_messages_conversation_recent')
    .on('messages')
    .columns(['conversation_id', 'created_at'])
    .execute();

  // Index for workout instance date range queries
  await db.schema
    .createIndex('idx_workout_instances_date_range')
    .on('workout_instances')
    .columns(['client_id', 'date', 'session_type'])
    .execute();

  // Partial index for active microcycles
  await sql`CREATE INDEX idx_microcycles_active ON microcycles (user_id) WHERE is_active = true`.execute(db);

  // Index for subscription status checks
  await sql`CREATE INDEX idx_subscriptions_active ON subscriptions (user_id, status) WHERE status = 'active'`.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
  // Drop all triggers
  await sql`DROP TRIGGER IF EXISTS update_workout_instances_updated_at ON workout_instances;`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_microcycles_updated_at ON microcycles;`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_fitness_plans_updated_at ON fitness_plans;`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_users_updated_at ON users;`.execute(db);

  // Drop performance indexes
  await db.schema.dropIndex('idx_subscriptions_active').ifExists().execute();
  await db.schema.dropIndex('idx_microcycles_active').ifExists().execute();
  await db.schema.dropIndex('idx_workout_instances_date_range').ifExists().execute();
  await db.schema.dropIndex('idx_messages_conversation_recent').ifExists().execute();
  await db.schema.dropIndex('idx_conversations_user_active_recent').ifExists().execute();
  await db.schema.dropIndex('idx_fitness_plans_user_active').ifExists().execute();

  // Drop admin activity logs indexes
  await db.schema.dropIndex('idx_admin_activity_logs_created_at').ifExists().execute();
  await db.schema.dropIndex('idx_admin_activity_logs_target').ifExists().execute();

  // Drop workout instances indexes
  await db.schema.dropIndex('idx_workout_instances_microcycle').ifExists().execute();
  await db.schema.dropIndex('idx_workout_instances_daily').ifExists().execute();

  // Drop microcycles indexes
  await db.schema.dropIndex('microcycles_active_user').ifExists().execute();
  await db.schema.dropIndex('microcycles_unique_week').ifExists().execute();

  // Drop fitness plans indexes
  await db.schema.dropIndex('idx_fitness_plans_client_fitness').ifExists().execute();
  await db.schema.dropIndex('idx_fitness_plans_client').ifExists().execute();

  // Drop conversation topics indexes
  await db.schema.dropIndex('idx_conversation_topics_topic').ifExists().execute();
  await db.schema.dropIndex('idx_conversation_topics_conversation_id').ifExists().execute();

  // Drop messages indexes
  await db.schema.dropIndex('idx_messages_user_id_created_at').ifExists().execute();
  await db.schema.dropIndex('idx_messages_created_at').ifExists().execute();
  await db.schema.dropIndex('idx_messages_conversation_id').ifExists().execute();

  // Drop conversations indexes
  await db.schema.dropIndex('idx_conversations_status').ifExists().execute();
  await db.schema.dropIndex('idx_conversations_last_message_at').ifExists().execute();
  await db.schema.dropIndex('idx_conversations_user_id').ifExists().execute();

  // Drop subscriptions indexes
  await db.schema.dropIndex('idx_subscriptions_stripe_subscription_id').ifExists().execute();
  await db.schema.dropIndex('idx_subscriptions_user_id').ifExists().execute();

  // Drop profile updates indexes
  await db.schema.dropIndex('idx_profile_updates_created_at').ifExists().execute();
  await db.schema.dropIndex('idx_profile_updates_user_id').ifExists().execute();

  // Drop users indexes
  await db.schema.dropIndex('idx_users_timezone').ifExists().execute();
  await db.schema.dropIndex('idx_users_send_hour').ifExists().execute();
  await db.schema.dropIndex('idx_users_stripe_customer_id').ifExists().execute();

  // Drop tables in reverse order of dependencies
  await db.schema.dropTable('admin_activity_logs').ifExists().execute();
  await db.schema.dropTable('workout_instances').ifExists().execute();
  await db.schema.dropTable('microcycles').ifExists().execute();
  await db.schema.dropTable('fitness_plans').ifExists().execute();
  await db.schema.dropTable('conversation_topics').ifExists().execute();
  await db.schema.dropTable('messages').ifExists().execute();
  await db.schema.dropTable('conversations').ifExists().execute();
  await db.schema.dropTable('subscriptions').ifExists().execute();
  await db.schema.dropTable('profile_updates').ifExists().execute();
  await db.schema.dropTable('users').ifExists().execute();

  // Drop the updated_at function
  await sql`DROP FUNCTION IF EXISTS update_updated_at_column();`.execute(db);

  // Drop extension
  await sql`DROP EXTENSION IF EXISTS "uuid-ossp"`.execute(db);
}