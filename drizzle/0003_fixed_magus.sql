CREATE TABLE `contributorRecordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contributorId` int NOT NULL,
	`phraseId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`audioUrl` text NOT NULL,
	`audioKey` varchar(255) NOT NULL,
	`type` enum('phrase','conversation','lesson') NOT NULL DEFAULT 'phrase',
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contributorRecordings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flashcardSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`flashcardId` int NOT NULL,
	`quality` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flashcardSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phraseId` int,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`audioUrl` text,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`nextReviewAt` timestamp NOT NULL DEFAULT (now()),
	`interval` int NOT NULL DEFAULT 1,
	`easeFactor` int NOT NULL DEFAULT 2500,
	`repetitions` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flashcards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','contributor') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `isContributorApproved` boolean DEFAULT false NOT NULL;