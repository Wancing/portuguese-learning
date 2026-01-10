CREATE TABLE `categoryPerformance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`totalPractices` int NOT NULL DEFAULT 0,
	`averageScore` int NOT NULL DEFAULT 0,
	`lastPracticeDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categoryPerformance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learningStreaks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastPracticeDate` timestamp,
	`totalDaysActive` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learningStreaks_id` PRIMARY KEY(`id`),
	CONSTRAINT `learningStreaks_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `phrasePracticeSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phraseId` int NOT NULL,
	`categoryId` int NOT NULL,
	`recordingId` int,
	`pronunciationScore` int,
	`feedback` text,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `phrasePracticeSessions_id` PRIMARY KEY(`id`)
);
