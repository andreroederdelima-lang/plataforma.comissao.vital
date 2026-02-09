ALTER TABLE `indicacoes` ADD `cpfCliente` varchar(14);--> statement-breakpoint
ALTER TABLE `indicacoes` ADD `dataAproximada` timestamp;--> statement-breakpoint
ALTER TABLE `indicacoes` DROP COLUMN `valorPlano`;--> statement-breakpoint
ALTER TABLE `indicacoes` DROP COLUMN `formaPagamento`;