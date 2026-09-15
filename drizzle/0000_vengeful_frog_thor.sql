CREATE TABLE `code_locks` (
	`codigo` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `teacher_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`turma` text NOT NULL,
	`codigo` text NOT NULL,
	`score` real NOT NULL,
	`answers` text NOT NULL,
	`saidas` integer NOT NULL,
	`at` text NOT NULL,
	`source` text NOT NULL
);
