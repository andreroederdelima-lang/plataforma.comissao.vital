ALTER TABLE `indicacoes` ADD `tipoComissao` enum('valor_fixo','percentual');--> statement-breakpoint
ALTER TABLE `indicacoes` ADD `valorComissao` int;--> statement-breakpoint
ALTER TABLE `users` ADD `chavePix` varchar(255);