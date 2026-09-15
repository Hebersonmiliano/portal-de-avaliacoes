import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
export const submissions = sqliteTable('submissions', {
 id:text('id').primaryKey(), name:text('name').notNull(), turma:text('turma').notNull(),
 codigo:text('codigo').notNull(), score:real('score').notNull(), answers:text('answers').notNull(),
 saidas:integer('saidas').notNull(), at:text('at').notNull(), source:text('source').notNull()
});
export const locks = sqliteTable('code_locks', {codigo:text('codigo').primaryKey(),submissionId:text('submission_id').notNull()});
export const sessions = sqliteTable('teacher_sessions', {token:text('token').primaryKey(),expires:integer('expires').notNull()});
