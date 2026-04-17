CREATE TABLE `beneficio_promotor` (
	`id` int AUTO_INCREMENT NOT NULL,
	`indicacaoId` int NOT NULL,
	`promotorId` int NOT NULL,
	`definidoPorUserId` int,
	`tipoBeneficio` enum('mensalidade_gratis','pix') NOT NULL,
	`valorCentavos` int,
	`chavePix` varchar(255),
	`status` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
	`observacoes` text,
	`dataPagamento` timestamp,
	`comprovantePagamento` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `beneficio_promotor_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('promotor','comercial','admin','vendedor_interno','vendedor_externo','admin_comercial','admin_plataforma') NOT NULL DEFAULT 'promotor';