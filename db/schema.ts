import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
export const submissions = sqliteTable('submissions', {
 id:text('id').primaryKey(), name:text('name').notNull(), turma:text('turma').notNull(),
 codigo:text('codigo').notNull(), score:real('score').notNull(), answers:text('answers').notNull(),
 saidas:integer('saidas').notNull(), at:text('at').notNull(), source:text('source').notNull()
});
export const locks = sqliteTable('code_locks', {codigo:text('codigo').primaryKey(),submissionId:text('submission_id').notNull()});
export const sessions = sqliteTable('teacher_sessions', {token:text('token').primaryKey(),expires:integer('expires').notNull()});
export const secureSessions = sqliteTable('secure_teacher_sessions', {token:text('token').primaryKey(),expires:integer('expires').notNull()});
export const rateLimits = sqliteTable('rate_limits', {key:text('key').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull()});
export const questionBank = sqliteTable('private_question_bank', {id:text('id').primaryKey(),payload:text('payload').notNull()});
export const secureCodes = sqliteTable('secure_codes', {codigo:text('codigo').primaryKey(),turma:text('turma').notNull(),slot:text('slot').notNull().unique(),state:text('state').notNull().default('available'),attemptId:text('attempt_id')});
export const attempts = sqliteTable('exam_attempts', {id:text('id').primaryKey(),codigo:text('codigo').notNull(),name:text('name').notNull(),turma:text('turma').notNull(),tokenHash:text('token_hash').notNull(),nonceHash:text('nonce_hash').notNull(),questions:text('questions').notNull(),created:integer('created').notNull(),expires:integer('expires').notNull(),status:text('status').notNull().default('active')});
