CREATE TABLE `configuracoes_gerais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`linkCheckoutBase` varchar(500),
	`diasCancelamentoGratuito` int NOT NULL DEFAULT 7,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracoes_gerais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `linkCheckoutPersonalizado` varchar(100);