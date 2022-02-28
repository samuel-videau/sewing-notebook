CREATE DATABASE sewing;

use sewing;

CREATE TABLE `projects` (
  `id` int NOT NULL DEFAULT '0',
  `name` varchar(45) DEFAULT NULL,
  `description` varchar(135) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `sewing`.`supplies` (
  `id` INT NOT NULL DEFAULT 0,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(130) NULL,
  `quantity` INT NULL,
  `type` VARCHAR(15) NULL,
  `color` VARCHAR(10) NULL,
  PRIMARY KEY (`id`));

  CREATE TABLE `todos` (
  `id` int NOT NULL,
  `project_id` int NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `description` varchar(135) DEFAULT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `todos`
ADD CONSTRAINT fk_projectid
FOREIGN KEY (project_id) REFERENCES projects(id);

CREATE TABLE `supplies_required` (
  `id` INT NOT NULL,
  `todo_id` INT NOT NULL,
  `supply_id` INT NOT NULL,
  `quantity` INT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `supplies_required`
ADD CONSTRAINT fk_todoid
FOREIGN KEY (todo_id) REFERENCES todos(id);

ALTER TABLE `supplies_required`
ADD CONSTRAINT fk_supplyid
FOREIGN KEY (supply_id) REFERENCES supplies(id);
