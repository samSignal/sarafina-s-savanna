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
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Ascot','Bulawayo','Zimbabwe',-20.11420000,28.58620000,1,NULL,NULL),(2,'Barham Green','Bulawayo','Zimbabwe',-20.19040000,28.54280000,1,NULL,NULL),(3,'Beacon Hill','Bulawayo','Zimbabwe',-20.19090000,28.60620000,1,NULL,NULL),(4,'Bellevue','Bulawayo','Zimbabwe',-20.14980000,28.61790000,1,NULL,NULL),(5,'Belmont','Bulawayo','Zimbabwe',-20.15470000,28.54120000,1,NULL,NULL),(6,'Bradfield','Bulawayo','Zimbabwe',-20.14530000,28.56840000,1,NULL,NULL),(7,'Burnside','Bulawayo','Zimbabwe',-20.14020000,28.57770000,1,NULL,NULL),(8,'Cement','Bulawayo','Zimbabwe',-20.16720000,28.61280000,1,NULL,NULL),(9,'Cowdray Park','Bulawayo','Zimbabwe',-20.16570000,28.63120000,1,NULL,NULL),(10,'Donnington','Bulawayo','Zimbabwe',-20.11330000,28.55450000,1,NULL,NULL),(11,'Douglasdale','Bulawayo','Zimbabwe',-20.19320000,28.59540000,1,NULL,NULL),(12,'Eloana','Bulawayo','Zimbabwe',-20.16130000,28.61960000,1,NULL,NULL),(13,'Emakhandeni','Bulawayo','Zimbabwe',-20.14500000,28.62350000,1,NULL,NULL),(14,'Emganwini','Bulawayo','Zimbabwe',-20.20530000,28.57460000,1,NULL,NULL),(15,'Enqameni','Bulawayo','Zimbabwe',-20.10840000,28.54400000,1,NULL,NULL),(16,'Entumbane','Bulawayo','Zimbabwe',-20.11490000,28.54050000,1,NULL,NULL),(17,'Famona','Bulawayo','Zimbabwe',-20.18010000,28.56800000,1,NULL,NULL),(18,'Four Winds','Bulawayo','Zimbabwe',-20.12580000,28.62750000,1,NULL,NULL),(19,'Glengarry','Bulawayo','Zimbabwe',-20.18210000,28.60000000,1,NULL,NULL),(20,'Glenville','Bulawayo','Zimbabwe',-20.14510000,28.62260000,1,NULL,NULL),(21,'Granite Park','Bulawayo','Zimbabwe',-20.19680000,28.53190000,1,NULL,NULL),(22,'Greenhill','Bulawayo','Zimbabwe',-20.17190000,28.58460000,1,NULL,NULL),(23,'Gwabalanda','Bulawayo','Zimbabwe',-20.17480000,28.54090000,1,NULL,NULL),(24,'Harrisvale','Bulawayo','Zimbabwe',-20.13510000,28.61530000,1,NULL,NULL),(25,'Highmount','Bulawayo','Zimbabwe',-20.20400000,28.56210000,1,NULL,NULL),(26,'Hillcrest','Bulawayo','Zimbabwe',-20.16410000,28.55350000,1,NULL,NULL),(27,'Hillside','Bulawayo','Zimbabwe',-20.17350000,28.58510000,1,NULL,NULL),(28,'Hillside South','Bulawayo','Zimbabwe',-20.11410000,28.58230000,1,NULL,NULL),(29,'Hume Park','Bulawayo','Zimbabwe',-20.11920000,28.55440000,1,NULL,NULL),(30,'Hyde Park','Bulawayo','Zimbabwe',-20.17320000,28.60370000,1,NULL,NULL),(31,'Ilanda','Bulawayo','Zimbabwe',-20.15740000,28.59790000,1,NULL,NULL),(32,'Iminyela','Bulawayo','Zimbabwe',-20.20370000,28.57700000,1,NULL,NULL),(33,'Intinta','Bulawayo','Zimbabwe',-20.19810000,28.54300000,1,NULL,NULL),(34,'Jacaranda','Bulawayo','Zimbabwe',-20.11790000,28.61730000,1,NULL,NULL),(35,'Kelvin','Bulawayo','Zimbabwe',-20.13730000,28.56070000,1,NULL,NULL),(36,'Kenilworth','Bulawayo','Zimbabwe',-20.15150000,28.57300000,1,NULL,NULL),(37,'Khumalo','Bulawayo','Zimbabwe',-20.15210000,28.53210000,1,NULL,NULL),(38,'Kilmarnock','Bulawayo','Zimbabwe',-20.13500000,28.56040000,1,NULL,NULL),(39,'Kingsdale','Bulawayo','Zimbabwe',-20.12900000,28.60700000,1,NULL,NULL),(40,'Killarney','Bulawayo','Zimbabwe',-20.20100000,28.60100000,1,NULL,NULL),(41,'Kumalo','Bulawayo','Zimbabwe',-20.11090000,28.59170000,1,NULL,NULL),(42,'Lakeside','Bulawayo','Zimbabwe',-20.13970000,28.61330000,1,NULL,NULL),(43,'Lobenvale','Bulawayo','Zimbabwe',-20.18140000,28.63130000,1,NULL,NULL),(44,'Lochview','Bulawayo','Zimbabwe',-20.14810000,28.56770000,1,NULL,NULL),(45,'Luveve','Bulawayo','Zimbabwe',-20.14730000,28.57970000,1,NULL,NULL),(46,'Mabuthweni','Bulawayo','Zimbabwe',-20.19970000,28.53780000,1,NULL,NULL),(47,'Magwegwe','Bulawayo','Zimbabwe',-20.13910000,28.56840000,1,NULL,NULL),(48,'Magwegwe North','Bulawayo','Zimbabwe',-20.17300000,28.58980000,1,NULL,NULL),(49,'Magwegwe West','Bulawayo','Zimbabwe',-20.11080000,28.62180000,1,NULL,NULL),(50,'Mahatshula','Bulawayo','Zimbabwe',-20.19030000,28.59480000,1,NULL,NULL),(51,'Makhandeni','Bulawayo','Zimbabwe',-20.12770000,28.59510000,1,NULL,NULL),(52,'Makokoba','Bulawayo','Zimbabwe',-20.13710000,28.62260000,1,NULL,NULL),(53,'Malindela','Bulawayo','Zimbabwe',-20.17990000,28.57560000,1,NULL,NULL),(54,'Manningdale','Bulawayo','Zimbabwe',-20.11040000,28.58800000,1,NULL,NULL),(55,'Marimba','Bulawayo','Zimbabwe',-20.20340000,28.61110000,1,NULL,NULL),(56,'Matsheumhlope','Bulawayo','Zimbabwe',-20.12430000,28.57060000,1,NULL,NULL),(57,'Matshobana','Bulawayo','Zimbabwe',-20.11070000,28.60150000,1,NULL,NULL),(58,'Mganwini','Bulawayo','Zimbabwe',-20.13660000,28.53460000,1,NULL,NULL),(59,'Montrose','Bulawayo','Zimbabwe',-20.15090000,28.62740000,1,NULL,NULL),(60,'Morningside','Bulawayo','Zimbabwe',-20.18270000,28.53850000,1,NULL,NULL),(61,'Mpopoma','Bulawayo','Zimbabwe',-20.17080000,28.62330000,1,NULL,NULL),(62,'Mzilikazi','Bulawayo','Zimbabwe',-20.14960000,28.55670000,1,NULL,NULL),(63,'New Luveve','Bulawayo','Zimbabwe',-20.20420000,28.55800000,1,NULL,NULL),(64,'New Parklands','Bulawayo','Zimbabwe',-20.18160000,28.61290000,1,NULL,NULL),(65,'Newton West','Bulawayo','Zimbabwe',-20.11520000,28.58370000,1,NULL,NULL),(66,'Nguboyenja','Bulawayo','Zimbabwe',-20.14370000,28.59970000,1,NULL,NULL),(67,'Nketa','Bulawayo','Zimbabwe',-20.16910000,28.56620000,1,NULL,NULL),(68,'Nkulumane','Bulawayo','Zimbabwe',-20.14450000,28.58140000,1,NULL,NULL),(69,'North End','Bulawayo','Zimbabwe',-20.14020000,28.54400000,1,NULL,NULL),(70,'North Trenance','Bulawayo','Zimbabwe',-20.11920000,28.61170000,1,NULL,NULL),(71,'Northvale','Bulawayo','Zimbabwe',-20.19940000,28.61250000,1,NULL,NULL),(72,'Old Luveve','Bulawayo','Zimbabwe',-20.19520000,28.62340000,1,NULL,NULL),(73,'Old Magwegwe','Bulawayo','Zimbabwe',-20.15820000,28.53640000,1,NULL,NULL),(74,'Old Nic','Bulawayo','Zimbabwe',-20.11970000,28.57600000,1,NULL,NULL),(75,'Old Pumula','Bulawayo','Zimbabwe',-20.10920000,28.57020000,1,NULL,NULL),(76,'Paddonhurst','Bulawayo','Zimbabwe',-20.18840000,28.59340000,1,NULL,NULL),(77,'Parklands','Bulawayo','Zimbabwe',-20.13680000,28.59660000,1,NULL,NULL),(78,'Parkview','Bulawayo','Zimbabwe',-20.19570000,28.62520000,1,NULL,NULL),(79,'Pelandaba','Bulawayo','Zimbabwe',-20.13060000,28.61000000,1,NULL,NULL),(80,'Pelandaba West','Bulawayo','Zimbabwe',-20.18440000,28.54140000,1,NULL,NULL),(81,'Pumula','Bulawayo','Zimbabwe',-20.11770000,28.53720000,1,NULL,NULL),(82,'Pumula East','Bulawayo','Zimbabwe',-20.12220000,28.58350000,1,NULL,NULL),(83,'Pumula North','Bulawayo','Zimbabwe',-20.18470000,28.57080000,1,NULL,NULL),(84,'Pumula South','Bulawayo','Zimbabwe',-20.11550000,28.60020000,1,NULL,NULL),(85,'Queens Park','Bulawayo','Zimbabwe',-20.13070000,28.58840000,1,NULL,NULL),(86,'Queens Park East','Bulawayo','Zimbabwe',-20.20350000,28.62970000,1,NULL,NULL),(87,'Queens Park West','Bulawayo','Zimbabwe',-20.15510000,28.53980000,1,NULL,NULL),(88,'Rangemore','Bulawayo','Zimbabwe',-20.12410000,28.61420000,1,NULL,NULL),(89,'Raylton','Bulawayo','Zimbabwe',-20.12670000,28.61110000,1,NULL,NULL),(90,'Richmond','Bulawayo','Zimbabwe',-20.14920000,28.61600000,1,NULL,NULL),(91,'Riverside','Bulawayo','Zimbabwe',-20.19120000,28.60600000,1,NULL,NULL),(92,'Romney Park','Bulawayo','Zimbabwe',-20.18060000,28.56770000,1,NULL,NULL),(93,'Sauerstown','Bulawayo','Zimbabwe',-20.11620000,28.60850000,1,NULL,NULL),(94,'Selborne Park','Bulawayo','Zimbabwe',-20.13330000,28.57260000,1,NULL,NULL),(95,'Sizinda','Bulawayo','Zimbabwe',-20.10930000,28.61650000,1,NULL,NULL),(96,'Southwold','Bulawayo','Zimbabwe',-20.15030000,28.55600000,1,NULL,NULL),(97,'Steeldale','Bulawayo','Zimbabwe',-20.15890000,28.62420000,1,NULL,NULL),(98,'Suburbs','Bulawayo','Zimbabwe',-20.15380000,28.53800000,1,NULL,NULL),(99,'Sunnyside','Bulawayo','Zimbabwe',-20.19930000,28.56420000,1,NULL,NULL),(100,'Tegela','Bulawayo','Zimbabwe',-20.19900000,28.61750000,1,NULL,NULL),(101,'The Jungle','Bulawayo','Zimbabwe',-20.20360000,28.62500000,1,NULL,NULL),(102,'Thorngrove','Bulawayo','Zimbabwe',-20.13540000,28.57300000,1,NULL,NULL),(103,'Trenance','Bulawayo','Zimbabwe',-20.14480000,28.59670000,1,NULL,NULL),(104,'Tshabalala','Bulawayo','Zimbabwe',-20.13510000,28.62860000,1,NULL,NULL),(105,'Upper Rangemore','Bulawayo','Zimbabwe',-20.17350000,28.56890000,1,NULL,NULL),(106,'Waterford','Bulawayo','Zimbabwe',-20.13500000,28.56920000,1,NULL,NULL),(107,'West Somerton','Bulawayo','Zimbabwe',-20.14670000,28.54080000,1,NULL,NULL),(108,'Westgate','Bulawayo','Zimbabwe',-20.13780000,28.56860000,1,NULL,NULL),(109,'Westondale','Bulawayo','Zimbabwe',-20.18450000,28.54940000,1,NULL,NULL),(110,'Whitestone','Bulawayo','Zimbabwe',-20.16930000,28.57670000,1,NULL,NULL),(111,'Windsor Park','Bulawayo','Zimbabwe',-20.14590000,28.62930000,1,NULL,NULL),(112,'Woodlands','Bulawayo','Zimbabwe',-20.19330000,28.54670000,1,NULL,NULL),(113,'Worringham','Bulawayo','Zimbabwe',-20.20380000,28.62870000,1,NULL,NULL),(114,'Bulawayo City Hall','Bulawayo','Zimbabwe',-20.15530000,28.58130000,1,NULL,NULL),(115,'Bradfield Shopping Centre','Bulawayo','Zimbabwe',-20.17300000,28.59100000,1,NULL,NULL),(116,'Hillside Dams Conservancy','Bulawayo','Zimbabwe',-20.19800000,28.61500000,1,NULL,NULL);
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
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

-- Dump completed on 2026-02-28 11:31:11
