CREATE TABLE `configuracao_comissoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipoLead` varchar(20) NOT NULL,
	`percentualIndicador` int NOT NULL,
	`percentualVendedor` int NOT NULL,
	`descricao` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracao_comissoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `configuracao_comissoes_tipoLead_unique` UNIQUE(`tipoLead`)
);
--> statement-breakpoint
CREATE TABLE `planos_saude` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`categoria` varchar(50) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`precoMensal` int NOT NULL,
	`bonificacaoPadrao` int NOT NULL,
	`percentualPrimeiroMes` int NOT NULL,
	`ordem` int NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planos_saude_id` PRIMARY KEY(`id`)
);
