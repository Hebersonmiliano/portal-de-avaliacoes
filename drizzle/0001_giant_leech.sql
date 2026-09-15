CREATE TABLE `exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`codigo` text NOT NULL,
	`name` text NOT NULL,
	`turma` text NOT NULL,
	`token_hash` text NOT NULL,
	`nonce_hash` text NOT NULL,
	`questions` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `private_question_bank` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `secure_codes` (
	`codigo` text PRIMARY KEY NOT NULL,
	`turma` text NOT NULL,
	`slot` text NOT NULL,
	`state` text DEFAULT 'available' NOT NULL,
	`attempt_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `secure_codes_slot_unique` ON `secure_codes` (`slot`);--> statement-breakpoint
CREATE TABLE `secure_teacher_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
