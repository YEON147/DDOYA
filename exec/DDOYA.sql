-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: ddoya
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `body_part`
--

DROP TABLE IF EXISTS `body_part`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `body_part` (
  `body_part_id` tinyint NOT NULL,
  `body_part_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`body_part_id`),
  UNIQUE KEY `UKcdlvepod9jy1n4lswopnxq9x0` (`body_part_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `device_token`
--

DROP TABLE IF EXISTS `device_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device_token` (
  `device_token_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `device_type` enum('ANDROID','IOS') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fcm_token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`device_token_id`),
  KEY `FKdklq4fbedbwx14v2varmsjeb5` (`user_id`),
  CONSTRAINT `FKdklq4fbedbwx14v2varmsjeb5` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ingredient_interaction`
--

DROP TABLE IF EXISTS `ingredient_interaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredient_interaction` (
  `interaction_id` bigint NOT NULL AUTO_INCREMENT,
  `min_interval_hours` int DEFAULT NULL,
  `note` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('ANTAGONIST','SYNERGY') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ingredient_a` bigint NOT NULL,
  `ingredient_b` bigint NOT NULL,
  PRIMARY KEY (`interaction_id`),
  UNIQUE KEY `uk_ingredient_interaction_a_b` (`ingredient_a`,`ingredient_b`),
  KEY `FKfnxqu9du70xiek6bd4qajmx21` (`ingredient_b`),
  CONSTRAINT `FK87fun9u3fxss51ufo65x44xwu` FOREIGN KEY (`ingredient_a`) REFERENCES `ingredient_master` (`ingredient_id`),
  CONSTRAINT `FKfnxqu9du70xiek6bd4qajmx21` FOREIGN KEY (`ingredient_b`) REFERENCES `ingredient_master` (`ingredient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ingredient_master`
--

DROP TABLE IF EXISTS `ingredient_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredient_master` (
  `ingredient_id` bigint NOT NULL AUTO_INCREMENT,
  `absorption_note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `effect` enum('ENERGY','GUT','NEUTRAL','RELAX') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gi_irritant` bit(1) DEFAULT NULL,
  `normalized_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `ri_adult_f` decimal(10,0) DEFAULT NULL,
  `ri_adult_m` decimal(10,0) DEFAULT NULL,
  `ri_non_adult` decimal(10,0) DEFAULT NULL,
  `ri_pregnant` decimal(10,0) DEFAULT NULL,
  `solubility` enum('FAT','WATER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `synonyms` json DEFAULT NULL,
  `ul_adult_f` decimal(10,2) DEFAULT NULL,
  `ul_adult_m` decimal(10,2) DEFAULT NULL,
  `ul_non_adult` decimal(10,2) DEFAULT NULL,
  `ul_pregnant` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ingredient_id`),
  UNIQUE KEY `UKibwwj3u3do2wqfw5nfeif9ppu` (`normalized_name`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `intake_record`
--

DROP TABLE IF EXISTS `intake_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `intake_record` (
  `intake_record_id` bigint NOT NULL AUTO_INCREMENT,
  `action_at` datetime(6) DEFAULT NULL,
  `planned_at` datetime(6) NOT NULL,
  `status` enum('MISSED','SKIPPED','TAKEN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `schedule_id` bigint NOT NULL,
  PRIMARY KEY (`intake_record_id`),
  KEY `FK83096oyt9tng74ivgn07jmmff` (`schedule_id`),
  CONSTRAINT `FK83096oyt9tng74ivgn07jmmff` FOREIGN KEY (`schedule_id`) REFERENCES `intake_schedule` (`schedule_id`)
) ENGINE=InnoDB AUTO_INCREMENT=165 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `intake_schedule`
--

DROP TABLE IF EXISTS `intake_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `intake_schedule` (
  `schedule_id` bigint NOT NULL AUTO_INCREMENT,
  `dose_per_intake` int DEFAULT NULL,
  `intake_time` time(6) NOT NULL,
  `schedule_type` enum('CARRY','INTAKE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_supplement_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `is_active` bit(1) NOT NULL,
  PRIMARY KEY (`schedule_id`),
  KEY `FK4m0yhoaq93bxkh23q7u015fqv` (`user_supplement_id`),
  KEY `FKm31qc0ikd1hhy1r97ftk9e31d` (`user_id`),
  CONSTRAINT `FK4m0yhoaq93bxkh23q7u015fqv` FOREIGN KEY (`user_supplement_id`) REFERENCES `supplements` (`user_supplement_id`),
  CONSTRAINT `FKm31qc0ikd1hhy1r97ftk9e31d` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_delivery_log`
--

DROP TABLE IF EXISTS `notification_delivery_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_delivery_log` (
  `delivery_log_id` bigint NOT NULL AUTO_INCREMENT,
  `attempt_no` int NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `sent_at` datetime(6) NOT NULL,
  `schedule_id` bigint NOT NULL,
  `intake_record_id` bigint DEFAULT NULL,
  `body` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `related_id` bigint DEFAULT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('CARRY','INTAKE','REPURCHASE','TEST') COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`delivery_log_id`),
  KEY `FK19v5xccs6qnsopdhkebq85aj7` (`schedule_id`),
  KEY `FK8lvfr0q4tmxar5vbc36gc7pra` (`intake_record_id`),
  KEY `FKia782b2og44pe0v515s3f37iw` (`user_id`),
  CONSTRAINT `FK19v5xccs6qnsopdhkebq85aj7` FOREIGN KEY (`schedule_id`) REFERENCES `intake_schedule` (`schedule_id`),
  CONSTRAINT `FK8lvfr0q4tmxar5vbc36gc7pra` FOREIGN KEY (`intake_record_id`) REFERENCES `intake_record` (`intake_record_id`),
  CONSTRAINT `FKia782b2og44pe0v515s3f37iw` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=217 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `calcium` decimal(10,2) DEFAULT NULL,
  `iron` decimal(10,2) DEFAULT NULL,
  `manufacturer` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `niacin` decimal(10,2) DEFAULT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `riboflavin` decimal(10,2) DEFAULT NULL,
  `thiamin` decimal(10,2) DEFAULT NULL,
  `vitamin_a` decimal(10,2) DEFAULT NULL,
  `vitamin_c` decimal(10,2) DEFAULT NULL,
  `vitamin_d` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`product_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKghpmfn23vmxfu3spu3lfg4r2d` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=239 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_comments`
--

DROP TABLE IF EXISTS `report_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_comments` (
  `report_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `deficiency_comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `excess_comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `schedule_comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  CONSTRAINT `FK1i80qi03utu4wxo5vjvs4n4y6` FOREIGN KEY (`report_id`) REFERENCES `reports` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_ingredient_analysis`
--

DROP TABLE IF EXISTS `report_ingredient_analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_ingredient_analysis` (
  `report_ingredient_analysis_id` bigint NOT NULL AUTO_INCREMENT,
  `analysis_type` enum('DEFICIENCY','EXCESS','NORMAL') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_amount` decimal(10,2) DEFAULT NULL,
  `deficiency_amount` decimal(10,2) DEFAULT NULL,
  `deficiency_ratio` decimal(10,2) DEFAULT NULL,
  `excess_amount` decimal(10,2) DEFAULT NULL,
  `excess_ratio` decimal(10,2) DEFAULT NULL,
  `recommended_amount` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ingredient_id` bigint NOT NULL,
  `report_id` bigint NOT NULL,
  `normalized_ingredient_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`report_ingredient_analysis_id`),
  KEY `FKexoh1gxydv7fmoekc1vm6e42d` (`ingredient_id`),
  KEY `FKq3d546l6i6r1371spvbrnsm8w` (`report_id`),
  CONSTRAINT `FKexoh1gxydv7fmoekc1vm6e42d` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient_master` (`ingredient_id`),
  CONSTRAINT `FKq3d546l6i6r1371spvbrnsm8w` FOREIGN KEY (`report_id`) REFERENCES `reports` (`report_id`)
) ENGINE=InnoDB AUTO_INCREMENT=667 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_intake_timing_recommendation`
--

DROP TABLE IF EXISTS `report_intake_timing_recommendation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_intake_timing_recommendation` (
  `timing_recommendation_id` bigint NOT NULL AUTO_INCREMENT,
  `intake_timing` enum('AFTER_BREAKFAST','AFTER_DINNER','AFTER_LUNCH','BEFORE_BREAKFAST','BEFORE_DINNER','BEFORE_LUNCH','BEFORE_SLEEP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_id` bigint NOT NULL,
  `user_supplement_id` bigint NOT NULL,
  PRIMARY KEY (`timing_recommendation_id`),
  KEY `FKpfwt385tiu3rxrueum3u1kb2i` (`report_id`),
  KEY `FKqxw1mylsr4o2x6hblxs99ef7m` (`user_supplement_id`),
  CONSTRAINT `FKpfwt385tiu3rxrueum3u1kb2i` FOREIGN KEY (`report_id`) REFERENCES `reports` (`report_id`),
  CONSTRAINT `FKqxw1mylsr4o2x6hblxs99ef7m` FOREIGN KEY (`user_supplement_id`) REFERENCES `supplements` (`user_supplement_id`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_recommended_product`
--

DROP TABLE IF EXISTS `report_recommended_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_recommended_product` (
  `report_recommended_product_id` bigint NOT NULL AUTO_INCREMENT,
  `ingredient_id` bigint NOT NULL,
  `product_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_id` bigint NOT NULL,
  PRIMARY KEY (`report_recommended_product_id`),
  KEY `FKaaxitnlqljh995um92susyduk` (`ingredient_id`),
  KEY `FK2tyd5c72vkhjp1neotacfgw35` (`product_code`),
  KEY `FKiqlvx20eplkesr17jhixl3iy7` (`report_id`),
  CONSTRAINT `FK2tyd5c72vkhjp1neotacfgw35` FOREIGN KEY (`product_code`) REFERENCES `products` (`product_code`),
  CONSTRAINT `FKaaxitnlqljh995um92susyduk` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient_master` (`ingredient_id`),
  CONSTRAINT `FKiqlvx20eplkesr17jhixl3iy7` FOREIGN KEY (`report_id`) REFERENCES `reports` (`report_id`)
) ENGINE=InnoDB AUTO_INCREMENT=227 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `report_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `needs_refresh` bit(1) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`report_id`),
  UNIQUE KEY `UKc29wlg7b42duwp3r09r6ajd` (`user_id`),
  CONSTRAINT `FK2o32rer9hfweeylg7x8ut8rj2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `supplement_inventory`
--

DROP TABLE IF EXISTS `supplement_inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplement_inventory` (
  `inventory_id` bigint NOT NULL AUTO_INCREMENT,
  `stock_alert_enabled` bit(1) NOT NULL,
  `stock_quantity` int NOT NULL,
  `user_supplement_id` bigint NOT NULL,
  PRIMARY KEY (`inventory_id`),
  UNIQUE KEY `UK4wabyp6p1knrhnjmnlwbowt5t` (`user_supplement_id`),
  CONSTRAINT `FK6txlardh6cfm337lhelg7q02s` FOREIGN KEY (`user_supplement_id`) REFERENCES `supplements` (`user_supplement_id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `supplements`
--

DROP TABLE IF EXISTS `supplements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplements` (
  `user_supplement_id` bigint NOT NULL AUTO_INCREMENT,
  `alias` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `daily_dose` int NOT NULL,
  `dose_per_intake` int NOT NULL,
  `is_reflected` bit(1) NOT NULL,
  `pill_image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pill_reference_embedding_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body_part_id` tinyint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`user_supplement_id`),
  KEY `FKogcajcsecfp5qa8wtl6ce28wo` (`body_part_id`),
  KEY `FKojad4rrk63c2ehdpm58msd0ll` (`user_id`),
  CONSTRAINT `FKogcajcsecfp5qa8wtl6ce28wo` FOREIGN KEY (`body_part_id`) REFERENCES `body_part` (`body_part_id`),
  CONSTRAINT `FKojad4rrk63c2ehdpm58msd0ll` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_intake_timing_setting`
--

DROP TABLE IF EXISTS `user_intake_timing_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_intake_timing_setting` (
  `user_intake_timing_setting_id` bigint NOT NULL AUTO_INCREMENT,
  `intake_time` time(6) NOT NULL,
  `intake_timing` enum('AFTER_BREAKFAST','AFTER_DINNER','AFTER_LUNCH','BEFORE_BREAKFAST','BEFORE_DINNER','BEFORE_LUNCH','BEFORE_SLEEP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`user_intake_timing_setting_id`),
  UNIQUE KEY `uk_user_intake_timing` (`user_id`,`intake_timing`),
  CONSTRAINT `FK2ejjjm8k4nnx7su2bqv2ytra1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_notification_setting`
--

DROP TABLE IF EXISTS `user_notification_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notification_setting` (
  `user_id` bigint NOT NULL,
  `carry_notification_enabled` bit(1) NOT NULL,
  `intake_notification_enabled` bit(1) NOT NULL,
  `stock_notification_enabled` bit(1) NOT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `FKojs4bq4bd9e2ddgebqfcd3igk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_supplement_ingredient`
--

DROP TABLE IF EXISTS `user_supplement_ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_supplement_ingredient` (
  `amount` decimal(10,2) NOT NULL,
  `is_primary` bit(1) NOT NULL,
  `raw_ingredient_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `normalized_ingredient_id` bigint NOT NULL,
  `user_supplement_id` bigint NOT NULL,
  PRIMARY KEY (`normalized_ingredient_id`,`user_supplement_id`),
  KEY `FKtmxx498pwe8ihofsjk6fcblcn` (`user_supplement_id`),
  CONSTRAINT `FK3ylle4j5pdm4wwdj82vowc90o` FOREIGN KEY (`normalized_ingredient_id`) REFERENCES `ingredient_master` (`ingredient_id`),
  CONSTRAINT `FKtmxx498pwe8ihofsjk6fcblcn` FOREIGN KEY (`user_supplement_id`) REFERENCES `supplements` (`user_supplement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `birth_date` date NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('FEMALE','MALE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `height_cm` decimal(5,2) NOT NULL,
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight_kg` decimal(5,2) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-29 18:36:08
