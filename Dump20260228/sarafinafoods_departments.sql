-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: sarafinafoods
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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'ad7d1256-c6ae-11f0-8778-5c5310ec1f7e:1-8746';

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `points_multiplier` decimal(8,2) NOT NULL DEFAULT '1.00',
  `loyalty_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Bucthery','all meat','/storage/departments/FhYjXywRIABAMzzJ8RfeW7tB7GdfGjPATDHb5QZ1.jpg','Active','2026-01-23 11:00:20','2026-02-17 07:48:54',NULL,1.00,NULL),(2,'Fresh Produce','Fruits, vegetables, and leafy greens','/images/departments/cat-produce.jpg','Active','2026-01-23 11:17:58','2026-01-23 11:33:13',NULL,1.00,NULL),(3,'Spices & Seasonings','Authentic African spices and herbs','/images/departments/cat-spices.jpg','Active','2026-01-23 11:17:58','2026-01-23 11:33:13',NULL,1.00,NULL),(4,'Drinks','Traditional beverages, juices, and soft drinks','/images/departments/cat-drinks.jpg','Active','2026-01-23 11:17:58','2026-01-23 11:33:13',NULL,1.00,NULL),(5,'Clearance','Discounted items and special offers','/images/departments/cat-pantry.jpg','Active','2026-01-23 11:17:58','2026-01-23 11:33:13',NULL,1.00,NULL),(6,'Fresh Meat','Premium cuts and traditional favorites','/images/departments/cat-meat.jpg','Active','2026-01-23 11:33:13','2026-01-23 11:33:13',NULL,1.00,NULL),(7,'Snacks','Chips, biscuits and treats','/images/departments/cat-snacks.jpg','Active','2026-01-23 11:33:13','2026-01-23 11:33:13',NULL,1.00,NULL),(8,'Sarafina  savings.','Sarafina  savings.','/images/departments/Sarafina  savings.jpeg','Active','2026-02-17 06:40:34','2026-02-17 07:24:55',NULL,1.00,NULL),(9,'Sarafina  savings.','Sarafina  savings.','/images/departments/Sarafina  savings.jpeg','Inactive','2026-02-17 06:40:35','2026-02-17 06:54:51','2026-02-17 06:54:51',1.00,NULL),(10,'Sarafina  Foods','Sarafina  Foods','/storage/departments/yTLETpq7Tp1qtpPOHb7UDzmemGggUrDQR3JUTmgQ.jpg','Inactive','2026-02-17 07:31:37','2026-02-17 10:37:51',NULL,1.00,NULL),(11,'quo','A aliquam explicabo velit possimus facilis.','https://via.placeholder.com/640x480.png/001177?text=dolorum','active','2026-02-24 07:30:49','2026-02-26 15:34:53','2026-02-26 15:34:53',1.00,NULL),(12,'voluptas','Quisquam praesentium omnis quis nesciunt qui perferendis nam ut.','https://via.placeholder.com/640x480.png/000000?text=dolorum','inactive','2026-02-24 07:30:49','2026-02-26 15:34:58','2026-02-26 15:34:58',1.00,NULL),(13,'perspiciatis','Quasi perferendis quidem neque enim voluptatem quis eveniet.','https://via.placeholder.com/640x480.png/00dd99?text=cum','active','2026-02-24 07:30:49','2026-02-26 15:35:02','2026-02-26 15:35:02',1.00,NULL),(14,'fugiat','Qui magnam ut quos nobis ipsam ea suscipit.','https://via.placeholder.com/640x480.png/001177?text=voluptatem','inactive','2026-02-24 07:30:49','2026-02-26 15:35:08','2026-02-26 15:35:08',1.00,NULL),(15,'sunt','Dignissimos voluptatibus quia ut culpa aut libero aut illo.','https://via.placeholder.com/640x480.png/007777?text=sequi','active','2026-02-24 07:30:49','2026-02-26 15:35:13','2026-02-26 15:35:13',1.00,NULL),(16,'expedita','Nemo et a enim fuga rem asperiores debitis.','https://via.placeholder.com/640x480.png/0000ee?text=vitae','active','2026-02-24 07:31:13','2026-02-26 15:33:49','2026-02-26 15:33:49',1.00,NULL),(17,'nobis','Recusandae eligendi omnis totam officia et.','https://via.placeholder.com/640x480.png/00cc55?text=saepe','active','2026-02-24 07:31:13','2026-02-26 15:33:57','2026-02-26 15:33:57',1.00,NULL),(18,'omnis','Debitis et hic et ut.','https://via.placeholder.com/640x480.png/003344?text=dolorem','inactive','2026-02-24 07:31:13','2026-02-26 15:34:11','2026-02-26 15:34:11',1.00,NULL),(19,'voluptas','Debitis minima ea non aspernatur quo velit quo.','https://via.placeholder.com/640x480.png/00bbff?text=modi','inactive','2026-02-24 07:31:13','2026-02-26 15:34:20','2026-02-26 15:34:20',1.00,NULL),(20,'quia','Perferendis ipsa maiores explicabo autem est aspernatur molestias.','https://via.placeholder.com/640x480.png/00ff99?text=iure','active','2026-02-24 07:31:13','2026-02-26 15:34:49','2026-02-26 15:34:49',1.00,NULL),(21,'aut','Ratione ducimus rerum similique ea aliquam consectetur optio.','https://via.placeholder.com/640x480.png/00cc77?text=voluptatem','inactive','2026-02-24 07:31:44','2026-02-26 15:33:44','2026-02-26 15:33:44',1.00,NULL),(22,'quisquam','Totam quas sed rerum.','https://via.placeholder.com/640x480.png/00ff88?text=et','active','2026-02-24 07:31:45','2026-02-26 15:33:27','2026-02-26 15:33:27',1.00,NULL),(23,'et','Accusamus vero ipsa neque beatae id illo ut.','https://via.placeholder.com/640x480.png/001177?text=commodi','active','2026-02-24 07:31:45','2026-02-26 15:33:36','2026-02-26 15:33:36',1.00,NULL),(24,'perspiciatis','Et earum qui minima minus quia libero voluptas nisi.','https://via.placeholder.com/640x480.png/00eecc?text=dolorem','inactive','2026-02-24 07:31:45','2026-02-26 15:33:53','2026-02-26 15:33:53',1.00,NULL),(25,'necessitatibus','Autem alias similique iste eos.','https://via.placeholder.com/640x480.png/003377?text=tempore','active','2026-02-24 07:31:45','2026-02-26 15:33:40','2026-02-26 15:33:40',1.00,NULL),(26,'occaecati','Quas repellendus rem nobis sapiente.','https://via.placeholder.com/640x480.png/00bb55?text=voluptas','inactive','2026-02-24 07:32:13','2026-02-26 15:33:10','2026-02-26 15:33:10',1.00,NULL),(27,'praesentium','Laborum deleniti reiciendis rerum.','https://via.placeholder.com/640x480.png/00ffaa?text=nemo','active','2026-02-24 07:32:13','2026-02-26 15:33:15','2026-02-26 15:33:15',1.00,NULL),(28,'nihil','Quos possimus ex quidem nostrum sed et.','https://via.placeholder.com/640x480.png/008822?text=error','inactive','2026-02-24 07:32:13','2026-02-26 15:33:19','2026-02-26 15:33:19',1.00,NULL),(29,'qui','Sit eveniet quisquam labore at sint est quia voluptas.','https://via.placeholder.com/640x480.png/00bb55?text=dignissimos','inactive','2026-02-24 07:32:13','2026-02-26 15:33:32','2026-02-26 15:33:32',1.00,NULL),(30,'quia','Voluptatum qui reprehenderit voluptates voluptas iste.','https://via.placeholder.com/640x480.png/0077ee?text=aliquam','active','2026-02-24 07:32:13','2026-02-26 15:33:23','2026-02-26 15:33:23',1.00,NULL),(31,'Rina Huffman','Incididunt temporibu','/storage/departments/A5Nb1Tn4XhpOVWvupGEv6u4l5jxfd5MXxDTmOgo1.png','Active','2026-02-26 06:27:50','2026-02-26 15:35:26','2026-02-26 15:35:26',0.00,'Natus iure minus nos'),(32,'Gift Cards','Digital Gift Cards','/images/gift-card-department.jpg','Active','2026-02-26 08:06:44','2026-02-26 11:03:08','2026-02-26 11:03:08',1.00,NULL);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
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

-- Dump completed on 2026-02-28 10:11:08
