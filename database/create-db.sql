CREATE DATABASE if not exists cardsgo;

CREATE TABLE `cardsgo`.`cardsgo_data` (
  `id_cardsgo` INT NOT NULL AUTO_INCREMENT,
  `expiration` DATETIME NOT NULL,
  `user` VARCHAR(256) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id_cardsgo`));
