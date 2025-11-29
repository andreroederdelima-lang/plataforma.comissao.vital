ALTER TABLE `users` DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` text;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `openId` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `loginMethod` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_openId_unique` UNIQUE(`openId`);