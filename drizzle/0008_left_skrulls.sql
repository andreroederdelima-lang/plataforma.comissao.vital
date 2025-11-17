ALTER TABLE `comissaoConfig` DROP INDEX `comissaoConfig_tipoPlano_unique`;--> statement-breakpoint
ALTER TABLE `comissaoConfig` ADD `nomePlano` enum('essencial','premium') NOT NULL;--> statement-breakpoint
ALTER TABLE `comissaoConfig` ADD `categoria` enum('empresarial','pessoa_fisica') NOT NULL;--> statement-breakpoint
ALTER TABLE `indicacoes` ADD `nomePlano` enum('essencial','premium') NOT NULL;