CREATE TABLE `comissaoConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipoPlano` enum('familiar','individual') NOT NULL,
	`valorComissao` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comissaoConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `comissaoConfig_tipoPlano_unique` UNIQUE(`tipoPlano`)
);
