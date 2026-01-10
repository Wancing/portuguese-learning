CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phrases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`textPt` text NOT NULL,
	`textEn` text NOT NULL,
	`audioUrl` text NOT NULL,
	`audioKey` varchar(255) NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `phrases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userRecordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phraseId` int NOT NULL,
	`audioUrl` text NOT NULL,
	`audioKey` varchar(255) NOT NULL,
	`transcription` text,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userRecordings_id` PRIMARY KEY(`id`)
);
