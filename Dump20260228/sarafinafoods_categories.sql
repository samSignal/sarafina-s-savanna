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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `department_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_department_id_foreign` (`department_id`),
  CONSTRAINT `categories_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,6,'General Meat','Various meat products','Active','2026-01-24 16:04:46','2026-02-17 12:21:43',NULL),(2,13,'odio','Nisi praesentium magnam similique a.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(3,13,'veritatis','Et quo hic odio id.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(4,12,'ullam','Enim provident deleniti adipisci ipsa officia est doloremque rerum.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(5,15,'eos','Consequatur ut harum qui natus minus reprehenderit.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(6,11,'est','Sed soluta nobis exercitationem sint quam et.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(7,15,'ut','Officiis maiores asperiores necessitatibus corrupti.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(8,12,'quos','Nesciunt sint libero error.','active','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(9,13,'facere','Illum rem earum adipisci voluptas dolore.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(10,11,'consequatur','Earum explicabo expedita voluptatem aut minima et.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(11,11,'voluptatibus','Provident ea animi voluptas ut id ut.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(12,14,'et','Dolor deleniti facilis non eos.','active','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(13,13,'aut','Repellat et assumenda error sapiente temporibus.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(14,13,'sint','Tempore in autem iste aut reiciendis.','active','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(15,14,'asperiores','Magnam nihil sed suscipit delectus illo eius.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(16,14,'dolores','Ut reprehenderit velit non et.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(17,13,'autem','Repellat porro qui voluptatem commodi sed.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(18,11,'quibusdam','Eligendi praesentium voluptatum vitae eius.','active','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(19,13,'quod','Voluptatibus consequuntur nihil illum.','active','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(20,11,'nam','Libero libero et qui repellat.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(21,12,'iusto','Id vel quas corporis quis laborum eaque.','inactive','2026-02-24 07:30:49','2026-02-24 07:30:49',NULL),(22,20,'nisi','Cupiditate totam tempora amet quia quod nesciunt.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(23,20,'dolor','Dolore adipisci pariatur dolores.','inactive','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(24,19,'repudiandae','Veniam molestiae aut et quos iste.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(25,16,'nemo','Non id dolores est non tenetur mollitia delectus.','inactive','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(26,19,'provident','Rerum tenetur provident mollitia quia ea.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(27,18,'fugit','Cupiditate quia dolores labore ut quia dolorum sed.','inactive','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(28,18,'et','Nostrum aut pariatur aut vel.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(29,17,'ea','Ipsum quae esse occaecati consequatur.','inactive','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(30,20,'explicabo','A sunt dicta inventore in ut dicta ut.','inactive','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(31,16,'eos','Maiores non modi ducimus eaque.','inactive','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(32,18,'quam','Vero vero tempora nihil ad dolorem dignissimos.','inactive','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(33,16,'eum','Cupiditate placeat saepe molestiae voluptates.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(34,19,'maxime','Ad alias accusamus sunt nemo.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(35,19,'aperiam','Reiciendis ut sit aut repudiandae quas.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(36,20,'ut','Quo a vel animi ullam sed iusto laboriosam.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(37,18,'quis','Quia ut cupiditate et similique sit qui voluptatem.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(38,18,'nihil','Beatae omnis esse eos assumenda.','inactive','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(39,20,'est','Necessitatibus dolorem illo laboriosam nobis.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(40,18,'vero','Ut odit voluptas ut atque repellendus consequatur sed veniam.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(41,17,'neque','Velit consequatur veniam inventore rerum qui dolore quo.','active','2026-02-24 07:31:13','2026-02-24 07:31:13',NULL),(42,21,'quas','Laborum repellendus mollitia consectetur id voluptas voluptatem dolorum.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(43,25,'saepe','Mollitia aliquam voluptate ea debitis deleniti vitae.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(44,21,'id','Qui molestias eaque exercitationem.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(45,21,'est','Deleniti suscipit voluptas sed ex.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(46,23,'magni','Architecto ex unde pariatur et.','inactive','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(47,21,'qui','Qui porro perspiciatis ut.','inactive','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(48,23,'esse','Aut sunt accusamus est aspernatur.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(49,24,'porro','Voluptatum cumque ab provident alias quis neque eveniet.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(50,24,'voluptates','Quidem accusantium repellendus libero nihil adipisci inventore odit.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(51,24,'eum','Nobis repellat ea et aut qui exercitationem voluptas.','inactive','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(52,22,'excepturi','Quisquam ut accusantium voluptates aut vero et.','inactive','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(53,24,'quasi','Ut illo accusantium vitae et delectus.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(54,24,'vel','Dolorem dolore voluptas quasi dolorem aspernatur maxime aut.','inactive','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(55,21,'delectus','Earum eveniet voluptatibus consequuntur eaque ut sed.','inactive','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(56,21,'consectetur','Culpa officiis sit fugit ad.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(57,24,'eos','Enim quia recusandae laborum voluptas aliquam nisi expedita perferendis.','inactive','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(58,23,'alias','Sunt at tenetur quo dolores commodi.','inactive','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(59,24,'ea','Fugit vel beatae sit ut nostrum quasi sed ratione.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(60,23,'amet','Est dolor est assumenda explicabo.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(61,22,'inventore','Voluptatibus consequatur maiores aut rerum ad.','active','2026-02-24 07:31:45','2026-02-24 07:31:45',NULL),(62,30,'voluptas','Omnis eos corrupti sit eaque.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(63,26,'adipisci','Distinctio quia sed qui dignissimos nam sint qui optio.','active','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(64,27,'consequatur','Excepturi vero ipsum quia mollitia voluptas autem autem.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(65,30,'est','Accusantium quas est eligendi deserunt eaque alias.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(66,26,'veniam','Distinctio laudantium odit et.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(67,27,'enim','Voluptatem vitae illum aut incidunt voluptas corrupti.','active','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(68,28,'atque','In tenetur sed laudantium autem iure eveniet.','active','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(69,26,'ipsa','Similique sed a officiis et velit ut.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(70,28,'amet','Consequuntur tempore placeat voluptate blanditiis explicabo.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(71,29,'consectetur','Doloremque quisquam omnis ullam vel et voluptas magnam enim.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(72,30,'incidunt','Accusantium molestiae sunt illum qui.','active','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(73,29,'in','A est quo nihil ut iste corrupti magnam.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(74,27,'ipsam','Accusantium sit eum nam voluptate consequatur.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(75,29,'aut','Placeat rerum enim dolorem pariatur.','active','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(76,27,'deleniti','Tempora commodi cum id dolorum.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(77,28,'natus','Delectus deleniti laboriosam asperiores aut odit ea iure.','active','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(78,26,'quis','Dolores nobis qui adipisci fuga delectus culpa quo.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(79,27,'aspernatur','Et et inventore suscipit qui quasi est.','active','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(80,27,'dolore','Eaque consequatur id hic labore.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(81,27,'saepe','Voluptatibus exercitationem maiores ea veritatis minus.','inactive','2026-02-24 07:32:13','2026-02-24 07:32:13',NULL),(82,32,'Digital Gift Cards','Purchase digital gift cards for friends and family.','Active','2026-02-26 08:06:44','2026-02-26 08:06:44',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
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
