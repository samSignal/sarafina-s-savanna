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
-- Table structure for table `schools`
--

DROP TABLE IF EXISTS `schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schools` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schools`
--

LOCK TABLES `schools` WRITE;
/*!40000 ALTER TABLE `schools` DISABLE KEYS */;
INSERT INTO `schools` VALUES (1,'Whitestone School','Whitestone Way, Burnside','Bulawayo','Zimbabwe',-20.21085000,28.61740000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(2,'Petra Primary School','Ilanda','Bulawayo','Zimbabwe',-20.18500000,28.61500000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(3,'Carmel School','Redrup Street, Suburbs','Bulawayo','Zimbabwe',-20.17500000,28.60500000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(4,'Coghlan Primary School','Corner 12th Avenue & Pauling Road, Suburbs','Bulawayo','Zimbabwe',-20.16200000,28.59200000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(5,'Kumalo Primary School','Corner George Avenue & 3rd Street, Kumalo','Bulawayo','Zimbabwe',-20.14500000,28.60000000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(6,'Centenary School','Lawley Road, Suburbs','Bulawayo','Zimbabwe',-20.17000000,28.58500000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(7,'Fairbridge Primary School','Queens Road, North End','Bulawayo','Zimbabwe',-20.13000000,28.59000000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(8,'Henry Low Primary School','Cecil Avenue, Hillside','Bulawayo','Zimbabwe',-20.19800000,28.61200000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(9,'Hillside Primary School','Cecil Avenue, Hillside','Bulawayo','Zimbabwe',-20.19200000,28.60500000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(10,'Hugh Beadle Primary School','Sauerstown','Bulawayo','Zimbabwe',-20.11500000,28.57500000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(11,'King George VI Centre','George Avenue, Kumalo','Bulawayo','Zimbabwe',-20.16500000,28.59500000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(12,'Milton Junior School','Townsend Road, Suburbs','Bulawayo','Zimbabwe',-20.16000000,28.59800000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(13,'St. Thomas Aquinas Primary School','Corner Park Road & 3rd Avenue, Suburbs','Bulawayo','Zimbabwe',-20.16300000,28.60200000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(14,'Dominican Convent Primary School','Lobengula Street, Bulawayo CBD','Bulawayo','Zimbabwe',-20.15600000,28.58200000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(15,'Masiyephambili Junior School','Montrose','Bulawayo','Zimbabwe',-20.17800000,28.59500000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(16,'Baines Junior School','North End','Bulawayo','Zimbabwe',-20.12500000,28.58000000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(17,'Robert Tredgold Primary School','Lobengula Street','Bulawayo','Zimbabwe',-20.15200000,28.58800000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(18,'McKeurtan Primary School','Kenilworth','Bulawayo','Zimbabwe',-20.13500000,28.58500000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(19,'Tennyson Primary School','Malindela','Bulawayo','Zimbabwe',-20.18200000,28.58800000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(20,'Greenfield Primary School','Bellevue','Bulawayo','Zimbabwe',-20.18800000,28.56000000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(21,'Toddlers Rock Nursery School','Burnside','Bulawayo','Zimbabwe',-20.20800000,28.61500000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(22,'Bambini Pre-School','Suburbs','Bulawayo','Zimbabwe',-20.16500000,28.59000000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(23,'Little Steps Pre-School','Hillside','Bulawayo','Zimbabwe',-20.19000000,28.60200000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(24,'Peter Pan Nursery School','Suburbs','Bulawayo','Zimbabwe',-20.16100000,28.59100000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(25,'Humpty Dumpty Nursery School','Kumalo','Bulawayo','Zimbabwe',-20.15800000,28.60500000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(26,'Riverside Primary School','Riverside','Bulawayo','Zimbabwe',-20.20550000,28.62540000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(27,'Matsheumhlope Primary School','Matsheumhlope','Bulawayo','Zimbabwe',-20.19520000,28.63510000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(28,'Barham Green Primary School','Barham Green','Bulawayo','Zimbabwe',-20.17550000,28.56520000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(29,'Thomas Rudland Primary School','Morningside','Bulawayo','Zimbabwe',-20.17820000,28.57550000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(30,'Moray Primary School','Famona','Bulawayo','Zimbabwe',-20.17250000,28.57880000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(31,'Newton West Junior School','Newton West','Bulawayo','Zimbabwe',-20.18550000,28.55550000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(32,'Jungle Gym Nursery School','Suburbs','Bulawayo','Zimbabwe',-20.16350000,28.59550000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(33,'Busy Bees Nursery School','Hillside','Bulawayo','Zimbabwe',-20.19350000,28.60850000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(34,'Little People Nursery School','Malindela','Bulawayo','Zimbabwe',-20.18350000,28.59050000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(35,'Girls College Pre-School','Suburbs','Bulawayo','Zimbabwe',-20.16850000,28.59850000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(36,'Dominican Convent ECD','Lobengula Street','Bulawayo','Zimbabwe',-20.15650000,28.58250000,1,'2026-02-06 16:53:34','2026-02-06 16:53:34'),(37,'Test School 1770886311',NULL,'Bulawayo','Zimbabwe',-20.20000000,28.60000000,1,'2026-02-12 06:51:52','2026-02-12 06:51:52'),(38,'Test School 1770886365',NULL,'Bulawayo','Zimbabwe',-20.20000000,28.60000000,1,'2026-02-12 06:52:45','2026-02-12 06:52:45'),(39,'Test School 1770886442',NULL,'Bulawayo','Zimbabwe',-20.20000000,28.60000000,1,'2026-02-12 06:54:02','2026-02-12 06:54:02'),(40,'Test School 1770886525',NULL,'Bulawayo','Zimbabwe',-20.20000000,28.60000000,1,'2026-02-12 06:55:25','2026-02-12 06:55:25');
/*!40000 ALTER TABLE `schools` ENABLE KEYS */;
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
