CREATE TABLE `cards_recursos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`secao` varchar(50) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`link` varchar(500),
	`icone` varchar(50),
	`ordem` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cards_recursos_id` PRIMARY KEY(`id`)
);
