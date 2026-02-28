-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: saferideskids
-- ------------------------------------------------------
-- Server version	9.5.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'ad7d1256-c6ae-11f0-8778-5c5310ec1f7e:1-9115';

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trips` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `driver_id` bigint unsigned NOT NULL,
  `child_id` bigint unsigned NOT NULL,
  `scheduled_date` date NOT NULL,
  `type` enum('morning','afternoon') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'morning',
  `status` enum('scheduled','in_progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  `distance_km` decimal(8,3) DEFAULT NULL,
  `pricing_tier` tinyint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trips_driver_id_child_id_scheduled_date_type_unique` (`driver_id`,`child_id`,`scheduled_date`,`type`),
  KEY `trips_child_id_foreign` (`child_id`),
  CONSTRAINT `trips_child_id_foreign` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trips_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
INSERT INTO `trips` VALUES (1,3,1,'2026-01-17','morning','completed',12.000,1,'2026-01-20 17:28:34','2026-01-20 17:28:34'),(2,3,1,'2026-01-18','morning','completed',12.000,1,'2026-01-20 17:28:34','2026-01-20 17:28:34'),(3,4,2,'2026-01-19','morning','completed',8.500,1,'2026-01-20 17:28:34','2026-01-20 17:28:34'),(4,3,1,'2026-01-26','morning','scheduled',12.000,1,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(5,4,2,'2026-01-26','morning','scheduled',8.500,1,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(6,9,4,'2026-01-26','morning','scheduled',12.000,2,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(7,3,1,'2026-01-27','morning','scheduled',12.000,1,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(8,4,2,'2026-01-27','morning','scheduled',8.500,1,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(9,9,4,'2026-01-27','morning','scheduled',12.000,2,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(10,3,1,'2026-01-28','morning','scheduled',12.000,1,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(11,4,2,'2026-01-28','morning','scheduled',8.500,1,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(12,9,4,'2026-01-28','morning','scheduled',12.000,2,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(13,3,1,'2026-01-29','morning','scheduled',12.000,1,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(14,4,2,'2026-01-29','morning','scheduled',8.500,1,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(15,9,4,'2026-01-29','morning','scheduled',12.000,2,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(16,3,1,'2026-01-30','morning','scheduled',12.000,1,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(17,4,2,'2026-01-30','morning','scheduled',8.500,1,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(18,9,4,'2026-01-30','morning','scheduled',12.000,2,'2026-01-25 16:48:09','2026-01-25 18:49:33'),(20,3,1,'2026-02-03','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(21,3,1,'2026-02-04','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(22,3,1,'2026-02-05','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(23,3,1,'2026-02-06','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(24,3,1,'2026-02-09','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(25,3,1,'2026-02-10','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(26,3,1,'2026-02-11','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(27,3,1,'2026-02-12','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(28,3,1,'2026-02-13','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(29,3,1,'2026-02-16','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(30,3,1,'2026-02-17','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(31,3,1,'2026-02-18','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(32,3,1,'2026-02-19','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(33,3,1,'2026-02-20','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(34,3,1,'2026-02-23','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(35,3,1,'2026-02-24','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(36,4,2,'2026-02-02','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(37,4,2,'2026-02-03','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(38,4,2,'2026-02-04','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(39,4,2,'2026-02-05','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(40,4,2,'2026-02-06','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(41,4,2,'2026-02-09','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(42,4,2,'2026-02-10','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(43,4,2,'2026-02-11','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(44,4,2,'2026-02-12','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(45,4,2,'2026-02-13','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(46,4,2,'2026-02-16','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(47,4,2,'2026-02-17','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(48,4,2,'2026-02-18','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(49,4,2,'2026-02-19','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(50,4,2,'2026-02-20','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(51,4,2,'2026-02-23','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(52,4,2,'2026-02-24','morning','scheduled',NULL,1,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(53,9,4,'2026-02-02','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(54,9,4,'2026-02-03','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(55,9,4,'2026-02-04','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(56,9,4,'2026-02-05','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(57,9,4,'2026-02-06','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(58,9,4,'2026-02-09','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(59,9,4,'2026-02-10','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(60,9,4,'2026-02-11','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(61,9,4,'2026-02-12','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(62,9,4,'2026-02-13','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(63,9,4,'2026-02-16','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(64,9,4,'2026-02-17','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(65,9,4,'2026-02-18','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(66,9,4,'2026-02-19','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(67,9,4,'2026-02-20','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(68,9,4,'2026-02-23','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(69,9,4,'2026-02-24','morning','scheduled',NULL,2,'2026-01-25 16:57:47','2026-01-25 18:49:33'),(70,3,1,'2026-01-25','morning','completed',NULL,1,'2026-01-25 17:16:17','2026-01-25 18:39:58'),(71,4,2,'2026-01-25','morning','completed',NULL,1,'2026-01-25 17:16:17','2026-01-25 18:39:58'),(72,9,4,'2026-01-25','morning','completed',NULL,2,'2026-01-25 17:16:17','2026-01-25 18:39:58'),(73,9,5,'2026-01-26','morning','completed',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:56:46'),(74,9,5,'2026-01-27','morning','completed',NULL,2,'2026-01-25 18:33:15','2026-01-25 19:02:47'),(75,9,5,'2026-01-28','morning','in_progress',NULL,2,'2026-01-25 18:33:15','2026-01-25 19:08:22'),(76,9,5,'2026-01-29','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(77,9,5,'2026-01-30','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(78,9,5,'2026-02-02','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(79,9,5,'2026-02-03','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(80,9,5,'2026-02-04','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(81,9,5,'2026-02-05','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(82,9,5,'2026-02-06','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(83,9,5,'2026-02-09','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(84,9,5,'2026-02-10','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(85,9,5,'2026-02-11','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(86,9,5,'2026-02-12','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(87,9,5,'2026-02-13','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(88,9,5,'2026-02-16','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(89,9,5,'2026-02-17','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(90,9,5,'2026-02-18','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(91,9,5,'2026-02-19','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(92,9,5,'2026-02-20','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(93,9,5,'2026-02-23','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(94,9,5,'2026-02-24','morning','scheduled',NULL,2,'2026-01-25 18:33:15','2026-01-25 18:49:33'),(95,3,1,'2026-02-02','morning','completed',15.500,1,'2026-02-02 16:00:13','2026-02-02 16:00:13'),(97,3,4,'2026-02-02','morning','in_progress',15.500,1,'2026-02-02 16:07:50','2026-02-02 16:38:05');
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-28 13:35:19
