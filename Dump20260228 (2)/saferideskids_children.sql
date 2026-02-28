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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'ad7d1256-c6ae-11f0-8778-5c5310ec1f7e:1-8911';

--
-- Table structure for table `children`
--

DROP TABLE IF EXISTS `children`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `children` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date NOT NULL,
  `school_id` bigint unsigned NOT NULL,
  `pickup_location_id` bigint unsigned NOT NULL,
  `pickup_lat` decimal(10,8) DEFAULT NULL,
  `pickup_lng` decimal(11,8) DEFAULT NULL,
  `pickup_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medical_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `relationship` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `school_start_time` time DEFAULT NULL,
  `school_end_time` time DEFAULT NULL,
  `grade` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `children_parent_id_foreign` (`parent_id`),
  KEY `children_school_id_foreign` (`school_id`),
  KEY `children_pickup_location_id_foreign` (`pickup_location_id`),
  CONSTRAINT `children_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `children_pickup_location_id_foreign` FOREIGN KEY (`pickup_location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `children_school_id_foreign` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `children`
--

LOCK TABLES `children` WRITE;
/*!40000 ALTER TABLE `children` DISABLE KEYS */;
INSERT INTO `children` VALUES (1,2,'Emma','L.','2018-01-20',1,1,NULL,NULL,NULL,'Mild peanut allergy','2026-01-20 17:28:34','2026-01-20 17:28:34',NULL,NULL,NULL,NULL),(2,2,'Liam','J.','2020-01-20',2,2,NULL,NULL,NULL,'None','2026-01-20 17:28:34','2026-01-20 17:28:34',NULL,NULL,NULL,NULL),(3,2,'Junior','Doe','2015-05-15',1,1,NULL,NULL,NULL,'Peanut allergy','2026-01-22 19:02:15','2026-01-22 19:02:15','Father','08:30:00','15:30:00',NULL),(4,8,'Jnr Sam','Ndlovu','2019-12-30',1,1,NULL,NULL,NULL,NULL,'2026-01-22 19:05:37','2026-01-25 16:41:47','Father','20:50:00','22:00:00',NULL),(5,10,'Chevonne Zano','Tshuma','2020-01-01',23,21,NULL,NULL,NULL,NULL,'2026-01-25 18:31:44','2026-01-25 18:43:17','Guardian','22:59:00','23:59:00','Grade 1');
/*!40000 ALTER TABLE `children` ENABLE KEYS */;
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

-- Dump completed on 2026-02-28 11:31:12
