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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_type` enum('parent','driver','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'parent',
  `status` enum('pending','active','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `status_reason` text COLLATE utf8mb4_unicode_ci,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@safekids.test','2026-01-20 17:28:33','$2y$12$j6Yotivke8ffmqWnt/ThN.fzS.76DhyBjgaI.q7OIlRuwF80.cgOW','admin','active',NULL,NULL,'2026-01-20 17:28:33','2026-01-20 17:28:33'),(2,'Sarah Johnson','sarah@example.com','2026-01-20 17:28:33','$2y$12$jWWA6QtUsPQeZrbI/32flOHVy2FcUiFxpwgeGnt0rYTR2qhLO3MkO','parent','active',NULL,NULL,'2026-01-20 17:28:33','2026-01-20 17:28:33'),(3,'Driver A','driver.a@example.com','2026-01-20 17:28:33','$2y$12$Z2dAwKB8CTIKaDsvkRhtw.NWaQ6yhPtkMx6laPSLSS1yAH6rkUn.G','driver','active',NULL,NULL,'2026-01-20 17:28:33','2026-01-20 17:28:33'),(4,'Driver B','driver.b@example.com','2026-01-20 17:28:34','$2y$12$xjQZFj2rdASVX9RiTRgXneYT3TCNUb/HRhcrsW4Imb5UOST2rQV0a','driver','active',NULL,NULL,'2026-01-20 17:28:34','2026-01-20 17:28:34'),(5,'Driver C','driver.c@example.com','2026-01-20 17:28:34','$2y$12$QZFc20k/sE3HQzV7u12YxujpP7v5aCgmh0ZyKFXWZo7a3om.PLuSu','driver','active',NULL,NULL,'2026-01-20 17:28:34','2026-02-02 17:16:37'),(6,'Donna Kerr','tidi@mailinator.com',NULL,'$2y$12$ZhYMOWO76M7gGubQSjQG8OoBKu6xtpC03Zzpc0nKLv3VeSfdr2Ycy','parent','active',NULL,NULL,'2026-01-20 17:46:10','2026-01-20 17:46:10'),(7,'Demo Parent','demo_parent@saferidekids.com',NULL,'$2y$12$zkU7OqaMnWYj/xy3Gea2ZesxCUSwjirr7tMe0StIWrIKlKZGzSN/a','parent','suspended',NULL,NULL,'2026-01-22 18:20:53','2026-02-02 17:17:03'),(8,'SAM NDLOVU','sam@gmail.com',NULL,'$2y$12$JEAfkAvIYS9ig2gvO1.evu7jlySAhzI/dhG8MTBsKDUNOG65DE5qG','parent','active',NULL,'8D6NSuucFyE64ULOdzejtV0ZRpe0VVMK91Yv5cW3MyiTY021FpQWsDk44Tkl','2026-01-22 18:26:38','2026-01-22 18:26:38'),(9,'DRIVER SAM','driver@gmail.com',NULL,'$2y$12$rbY3yL7lBUZkyAt7NIuhw.f.EfTq4FIGChUt09Sst/h3O3FCj.miK','driver','active',NULL,NULL,'2026-01-24 06:13:16','2026-01-24 06:13:16'),(10,'Nomathalenta Tshuma','samndlovucrypto@gmail.com',NULL,'$2y$12$xiaK0OKOu1JNCh6V9e6RWO6xv8Ro9/ZXl4bgbVV2IPWpdLJvhi9Ym','parent','active',NULL,NULL,'2026-01-25 17:41:31','2026-01-25 19:05:08'),(11,'Admin User','saferidek@gmail.com','2026-02-06 16:39:33','$2y$12$2z5E80orrCxMRA4PfF4xHuF7ox/YeRXNSd7.4Gqe2IptTvV3NFRMW','admin','active',NULL,NULL,'2026-02-06 16:39:33','2026-02-28 09:18:30'),(13,'Parent 1770886311','parent1770886311@example.com',NULL,'$2y$12$/CxqEFiBE1.61uWPlZ8XzewC.p9CsAjwSASphSVrrW9HYVNqTwnya','parent','active',NULL,NULL,'2026-02-12 06:51:52','2026-02-12 06:51:52'),(14,'Driver 1770886311','driver1770886311@example.com',NULL,'$2y$12$eivh6GQsr8lrBA7FEAu79.KbQjRZiTJ0u7QPv7qTIy1V5dmztg1E.','driver','active',NULL,NULL,'2026-02-12 06:51:52','2026-02-12 06:51:52'),(15,'Parent 1770886365','parent1770886365@example.com',NULL,'$2y$12$pc5ZLecSKAS2EzeIV1bFUOKhlXpqV78L2ZiQdrlw3fO7i2PNpYeCa','parent','active',NULL,NULL,'2026-02-12 06:52:45','2026-02-12 06:52:45'),(16,'Driver 1770886365','driver1770886365@example.com',NULL,'$2y$12$yXekOWa3rPchJwPDBaiv4e3/sdjhsitlXZAY3Tm4nhVJ51Me7y742','driver','active',NULL,NULL,'2026-02-12 06:52:45','2026-02-12 06:52:45'),(17,'Full Driver 1770886365','fulldriver1770886365@example.com',NULL,'$2y$12$MFNocsLEPTxddkk/BDwLnOqa/scRAIqsib.lSeeSRtsK4dSjl8I26','driver','active',NULL,NULL,'2026-02-12 06:52:46','2026-02-12 06:52:46'),(18,'Pending Driver 1770886365','pendingdriver1770886365@example.com',NULL,'$2y$12$mXFX0jmUQlifqToPwS4aSOpMpuiYh8b8YeS9VoIeYKGjlWMOas0i.','driver','pending',NULL,NULL,'2026-02-12 06:52:46','2026-02-12 06:52:46'),(19,'WrongLoc Driver 1770886365','wrongloc1770886365@example.com',NULL,'$2y$12$Mwbjg1NgVaaGbM17AaG8YOhJgPzThSu8/Avo4xpQZd1y/QmT.9/r2','driver','active',NULL,NULL,'2026-02-12 06:52:46','2026-02-12 06:52:46'),(20,'Parent 1770886442','parent1770886442@example.com',NULL,'$2y$12$abwKVZ9tthhRivXSn7ZGg.C8az31E6t7yv6APoaQUdt1I22sTNmMu','parent','active',NULL,NULL,'2026-02-12 06:54:02','2026-02-12 06:54:02'),(21,'Driver 1770886442','driver1770886442@example.com',NULL,'$2y$12$7ArMqnIA.eoN8yi80ZZshegOA.BOoe84dXn48IVItR9ScenC5dROK','driver','active',NULL,NULL,'2026-02-12 06:54:02','2026-02-12 06:54:02'),(22,'Full Driver 1770886442','fulldriver1770886442@example.com',NULL,'$2y$12$9X0zFpq5VXsFOIjiFIEVkOqNUa82P4SFSQONDIF59WYAE06EgxDVi','driver','active',NULL,NULL,'2026-02-12 06:54:03','2026-02-12 06:54:03'),(23,'Pending Driver 1770886442','pendingdriver1770886442@example.com',NULL,'$2y$12$TxLhhCe0lc4m7mo7483zS.w6is7jn89wzt./NROmity1eIE.rhH46','driver','pending',NULL,NULL,'2026-02-12 06:54:03','2026-02-12 06:54:03'),(24,'WrongLoc Driver 1770886442','wrongloc1770886442@example.com',NULL,'$2y$12$kBJICy9EWhsakMAqp7a7juqzngs0Mp/NzgNVJUkTovlIqvFdB1ORC','driver','active',NULL,NULL,'2026-02-12 06:54:03','2026-02-12 06:54:03'),(25,'Parent 1770886525','parent1770886525@example.com',NULL,'$2y$12$XYxQEDfPnM3t.vB5YhPouuvlkginX1tQbP47hiDV4.BtYq/wgvPK2','parent','active',NULL,NULL,'2026-02-12 06:55:25','2026-02-12 06:55:25'),(26,'Driver 1770886525','driver1770886525@example.com',NULL,'$2y$12$q.G9LaDoSp0rpfww8X79JejPDOIvJ9fVzxYPxnTIZ6NFaVN/yY.we','driver','active',NULL,NULL,'2026-02-12 06:55:25','2026-02-12 06:55:25'),(27,'Full Driver 1770886525','fulldriver1770886525@example.com',NULL,'$2y$12$PXxGvuFT/yD86DC5mu61TOByR/T4LOef.rIqOhgm8JAtofOAa8r4a','driver','active',NULL,NULL,'2026-02-12 06:55:26','2026-02-12 06:55:26'),(28,'Pending Driver 1770886525','pendingdriver1770886525@example.com',NULL,'$2y$12$rTuW6VWF1FxJudIfVXlUC.J66cFS.bkfENkYN.Av.dT4gl6w4DKz.','driver','pending',NULL,NULL,'2026-02-12 06:55:26','2026-02-12 06:55:26'),(29,'WrongLoc Driver 1770886525','wrongloc1770886525@example.com',NULL,'$2y$12$XAQbuj3f0hb3N/hIimgYZOtup8HQteX6ymwwF50FJ7IaRHbiHsypq','driver','active',NULL,NULL,'2026-02-12 06:55:26','2026-02-12 06:55:26');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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

-- Dump completed on 2026-02-28 13:35:18
