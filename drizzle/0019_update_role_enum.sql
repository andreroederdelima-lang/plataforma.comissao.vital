-- Migração para atualizar enum de role para o novo sistema de 3 roles
-- Remove roles antigos (user, vendedor) e adiciona novo role (promotor)
ALTER TABLE `users` MODIFY COLUMN `role` enum('promotor','comercial','admin') NOT NULL DEFAULT 'promotor';
