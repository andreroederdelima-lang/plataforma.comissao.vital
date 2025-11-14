CREATE TABLE `indicacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parceiroId` int NOT NULL,
	`nomeIndicado` varchar(255) NOT NULL,
	`whatsappIndicado` varchar(20) NOT NULL,
	`tipoPlano` enum('familiar','individual') NOT NULL,
	`categoria` enum('empresarial','pessoa_fisica') NOT NULL,
	`observacoes` text,
	`status` enum('pendente','em_analise','aprovada','recusada') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `indicacoes_id` PRIMARY KEY(`id`)
);
