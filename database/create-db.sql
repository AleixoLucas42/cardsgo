CREATE DATABASE if not exists cardsgo;

CREATE TABLE `cardsgo`.`cardsgo_data` (
  `id_cardsgo` INT NOT NULL AUTO_INCREMENT,
  `expiration` DATETIME NOT NULL,
  `user` VARCHAR(256) NOT NULL,
  `data` VARCHAR(999) NOT NULL,
  PRIMARY KEY (`id_cardsgo`));

INSERT INTO `cardsgo`.`cardsgo_data` (`expiration`, `user`, `data`) VALUES ('2022-06-24', 'aleixo', '{\"todo\": [\"Database card\"],\"doing\": [],\"done\": [],\"blocked\": []}');


UPDATE cardsgo.cardsgo_data SET expiration = adddate(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL 1 MONTH) WHERE user = 'aleixo';