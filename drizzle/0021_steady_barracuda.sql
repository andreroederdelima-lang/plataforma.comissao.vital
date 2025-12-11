CREATE TABLE `materiais_apoio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` varchar(50) NOT NULL,
	`urlArquivo` varchar(500) NOT NULL,
	`thumbnailUrl` varchar(500),
	`tamanhoBytes` int,
	`ordem` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materiais_apoio_id` PRIMARY KEY(`id`)
);
