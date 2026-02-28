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
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_01_23_125635_create_departments_table',2),(5,'2026_01_23_130221_create_personal_access_tokens_table',3),(6,'2026_01_23_130729_create_categories_table',3),(7,'2026_01_23_131630_create_products_table',4),(8,'2026_01_23_133154_add_image_to_departments_table',5),(9,'2026_01_24_193802_add_role_to_users_table',6),(10,'2026_01_24_201655_add_phone_to_users_table',7),(11,'2026_01_24_201917_create_orders_table',8),(12,'2026_01_24_201918_create_order_items_table',8),(13,'2026_02_16_130000_add_total_to_orders_table',9),(14,'2026_02_17_150500_add_pricing_columns_to_order_items_table',10),(15,'2026_02_18_090000_drop_price_from_order_items_table',11),(16,'2026_02_18_091000_drop_total_from_order_items_table',12),(17,'2026_02_18_120000_add_pricing_columns_to_products_table',13),(18,'2026_02_18_130000_add_currency_and_total_amount_to_orders_table',14),(19,'2026_02_24_000000_add_shipping_details_to_orders_table',15),(20,'2026_02_25_090248_add_exchange_rate_and_total_gbp_to_orders_table',16),(21,'2026_02_25_094357_add_delivery_fields_to_orders_table',17),(22,'2026_02_25_094407_create_delivery_settings_table',17),(23,'2026_02_25_132432_add_loyalty_fields_to_users_table',18),(24,'2026_02_25_132433_add_points_multiplier_to_departments_table',18),(25,'2026_02_25_132434_create_loyalty_transactions_table',18),(26,'2026_02_25_132731_add_loyalty_fields_to_orders_table',19),(27,'2026_02_25_142312_add_loyalty_reason_to_departments_table',20),(28,'2026_02_26_150000_create_loyalty_settings_table',21),(30,'2026_02_26_095716_create_gift_cards_table',22),(31,'2026_02_26_095800_create_gift_card_transactions_table',22),(32,'2026_02_26_100432_add_type_to_products_table',23),(33,'2026_02_26_100719_add_metadata_to_order_items_table',24),(34,'2026_02_26_101708_add_gift_card_discount_to_orders_table',25),(35,'2026_02_26_102419_create_gift_card_audit_logs_table',26),(36,'2026_02_26_111543_add_deleted_at_to_gift_cards_table',26),(37,'2026_02_26_125557_make_department_id_nullable_in_products_table',27),(38,'2026_02_26_175352_add_low_stock_threshold_to_products_table',28);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
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

-- Dump completed on 2026-02-28 10:11:09
