CREATE DATABASE sewing;

use sewing;

CREATE TABLE `users` (
  `id` INT NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `password` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE);

  CREATE TABLE `projects` (
    `id` int NOT NULL,
    `name` varchar(45) DEFAULT NULL,
    `description` varchar(135) DEFAULT NULL,
    PRIMARY KEY (`id`)
  );

CREATE TABLE `project_auth` (
  `projectId` INT NOT NULL,
  `userId` INT NOT NULL,
  CONSTRAINT `projectid_fk`
    FOREIGN KEY (`projectId`)
    REFERENCES `projects` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `userid_fk`
    FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

CREATE TABLE `supplies` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(130) NULL,
  `quantity` INT NULL,
  `type` VARCHAR(15) NULL,
  `color` VARCHAR(10) NULL,
  PRIMARY KEY (`id`));


CREATE TABLE `todos` (
  `id` int NOT NULL DEFAULT 0,
  `projectId` int NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `description` varchar(135) DEFAULT NULL,
  `completed` TINYINT NULL,
  PRIMARY KEY (`id`));


ALTER TABLE `todos`
ADD CONSTRAINT fk_projectid
FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE;

CREATE TABLE `supplies_required` (
  `id` int NOT NULL,
  `todoId` int NOT NULL,
  `supplyId` int NOT NULL,
  `quantity` int DEFAULT NULL,
  PRIMARY KEY (`id`));


ALTER TABLE `supplies_required`
ADD CONSTRAINT fk_todoid
FOREIGN KEY (todoId) REFERENCES todos(id) ON DELETE CASCADE;

ALTER TABLE `supplies_required`
ADD CONSTRAINT fk_supplyid
FOREIGN KEY (supplyId) REFERENCES supplies(id);

