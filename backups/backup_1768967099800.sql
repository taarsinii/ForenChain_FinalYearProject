-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: forenchain_system
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_ip_address` varchar(50) DEFAULT NULL,
  `details` text,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=291 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,3,'User logged in','2025-11-20 19:45:32','::1',NULL),(2,3,'User logged in','2025-11-20 19:45:55','::1',NULL),(3,3,'User logged in','2025-11-20 20:05:29','::1',NULL),(4,3,'User logged in','2025-11-20 20:33:52','::1',NULL),(5,3,'User logged in','2025-11-20 20:40:06','::1',NULL),(6,3,'User logged in','2025-11-20 20:41:20','::1',NULL),(7,NULL,'Viewed Admin Dashboard','2025-11-21 06:26:31','::1',NULL),(8,NULL,'Viewed Manage Users page','2025-11-21 06:26:34','::1',NULL),(9,NULL,'Updated user ID: 3 (admin12)','2025-11-21 06:27:04','::1',NULL),(10,NULL,'Viewed Manage Users page','2025-11-21 06:27:04','::1',NULL),(11,NULL,'Viewed Admin Dashboard','2025-11-21 06:35:35','::1',NULL),(12,NULL,'Viewed Manage Users page','2025-11-21 06:35:38','::1',NULL),(13,NULL,'Viewed Audit Logs','2025-11-21 06:35:46','::1',NULL),(14,NULL,'Viewed Admin Dashboard','2025-11-21 06:36:00','::1',NULL),(15,NULL,'Viewed Admin Dashboard','2025-11-21 07:32:45','::1',NULL),(16,NULL,'Viewed Manage Users page','2025-11-21 07:32:48','::1',NULL),(17,NULL,'Viewed Admin Dashboard','2025-11-21 07:40:07','::1',NULL),(18,NULL,'Viewed Manage Users page','2025-11-21 07:40:09','::1',NULL),(19,NULL,'Viewed Audit Logs','2025-11-21 07:40:11','::1',NULL),(20,NULL,'Viewed Admin Dashboard','2025-11-21 07:40:22','::1',NULL),(21,NULL,'Viewed Manage Users page','2025-11-21 07:40:26','::1',NULL),(22,NULL,'Viewed Audit Logs','2025-11-21 07:40:27','::1',NULL),(23,NULL,'Viewed Admin Dashboard','2025-11-21 07:41:04','::1',NULL),(24,NULL,'Viewed Admin Dashboard','2025-11-21 07:49:24','::1',NULL),(25,NULL,'Viewed Manage Users page','2025-11-21 07:49:26','::1',NULL),(26,NULL,'Created new user: taarsinii22','2025-11-21 07:49:49','::1',NULL),(27,NULL,'Viewed Manage Users page','2025-11-21 07:49:49','::1',NULL),(28,NULL,'Updated user ID: 5 (taarsinii22)','2025-11-21 07:50:04','::1',NULL),(29,NULL,'Viewed Manage Users page','2025-11-21 07:50:05','::1',NULL),(30,NULL,'Deleted user ID: 5','2025-11-21 07:50:22','::1',NULL),(31,NULL,'Viewed Manage Users page','2025-11-21 07:50:22','::1',NULL),(32,NULL,'Viewed Audit Logs','2025-11-21 07:50:25','::1',NULL),(33,NULL,'Viewed Admin Dashboard','2025-11-21 07:50:29','::1',NULL),(34,NULL,'Viewed Manage Users page','2025-11-21 07:50:31','::1',NULL),(35,NULL,'Viewed Admin Dashboard','2025-11-21 07:53:50','::1',NULL),(36,NULL,'Viewed Manage Users page','2025-11-21 07:53:52','::1',NULL),(37,NULL,'Viewed Admin Dashboard','2025-11-21 22:55:53','::1',NULL),(38,NULL,'Viewed Manage Users page','2025-11-21 22:55:55','::1',NULL),(39,NULL,'Viewed Audit Logs','2025-11-21 22:56:00','::1',NULL),(40,3,'User logged in','2025-11-22 01:38:54','::1',NULL),(41,NULL,'Viewed Admin Dashboard','2025-11-22 01:42:50','::1',NULL),(42,NULL,'Viewed Manage Users page','2025-11-22 01:42:51','::1',NULL),(43,NULL,'Viewed Audit Logs','2025-11-22 01:42:54','::1',NULL),(44,3,'Viewed Admin Dashboard','2025-11-22 01:59:37','::1',NULL),(45,3,'Viewed Manage Users page','2025-11-22 01:59:39','::1',NULL),(46,3,'Viewed Audit Logs','2025-11-22 01:59:41','::1',NULL),(47,3,'Viewed Admin Dashboard','2025-11-22 02:00:03','::1',NULL),(48,3,'Viewed Manage Users page','2025-11-22 02:00:04','::1',NULL),(49,3,'Created new user: taarsinii22','2025-11-22 02:00:19','::1',NULL),(50,3,'Viewed Manage Users page','2025-11-22 02:00:19','::1',NULL),(51,3,'Viewed Audit Logs','2025-11-22 02:00:21','::1',NULL),(52,3,'Viewed Admin Dashboard','2025-11-22 02:00:33','::1',NULL),(53,3,'Viewed Manage Users page','2025-11-22 02:00:35','::1',NULL),(54,3,'Deleted user ID: 6','2025-11-22 02:00:40','::1',NULL),(55,3,'Viewed Manage Users page','2025-11-22 02:00:40','::1',NULL),(56,3,'Viewed Audit Logs','2025-11-22 02:00:43','::1',NULL),(57,3,'Viewed Admin Dashboard','2025-11-22 02:04:27','::1',NULL),(58,3,'Viewed Manage Users page','2025-11-22 02:04:29','::1',NULL),(59,3,'Updated user ID: 3 (admin1)','2025-11-22 02:04:34','::1',NULL),(60,3,'Viewed Manage Users page','2025-11-22 02:04:34','::1',NULL),(61,3,'Viewed Audit Logs','2025-11-22 02:04:36','::1',NULL),(62,3,'Viewed Admin Dashboard','2025-11-22 14:58:23','::1',NULL),(63,3,'Viewed Manage Users page','2025-11-22 14:58:26','::1',NULL),(64,3,'Created new user: investigator1','2025-11-22 14:59:13','::1',NULL),(65,3,'Viewed Manage Users page','2025-11-22 14:59:13','::1',NULL),(66,3,'Viewed Admin Dashboard','2025-11-23 19:39:32','::1',NULL),(67,3,'Viewed Manage Users page','2025-11-23 19:39:33','::1',NULL),(68,3,'Viewed Audit Logs','2025-11-23 19:39:36','::1',NULL),(69,3,'Viewed Admin Dashboard','2025-11-23 19:39:41','::1',NULL),(70,3,'Viewed Manage Users page','2025-11-23 19:39:43','::1',NULL),(71,3,'Updated user ID: 3 (admin123)','2025-11-23 19:39:52','::1',NULL),(72,3,'Viewed Manage Users page','2025-11-23 19:39:52','::1',NULL),(73,3,'Viewed Audit Logs','2025-11-23 19:39:53','::1',NULL),(74,3,'Viewed Admin Dashboard','2025-11-23 19:40:00','::1',NULL),(75,3,'Viewed Admin Dashboard','2025-11-23 19:49:19','::1',NULL),(76,3,'Viewed Manage Users page','2025-11-23 19:49:21','::1',NULL),(77,3,'Viewed Audit Logs','2025-11-23 19:49:23','::1',NULL),(78,3,'Viewed Admin Dashboard','2025-11-23 19:59:57','::1',NULL),(79,3,'Viewed Manage Users page','2025-11-23 19:59:59','::1',NULL),(80,3,'Viewed Audit Logs','2025-11-23 20:00:04','::1',NULL),(81,3,'Viewed Admin Dashboard','2025-11-23 20:02:51','::1',NULL),(82,3,'Viewed Manage Users page','2025-11-23 20:02:53','::1',NULL),(83,3,'Viewed Audit Logs','2025-11-23 20:02:54','::1',NULL),(84,3,'Viewed Admin Dashboard','2025-11-23 20:05:05','::1',NULL),(85,3,'Viewed Manage Users page','2025-11-23 20:05:17','::1',NULL),(86,3,'Viewed Audit Logs','2025-11-23 20:05:19','::1',NULL),(87,7,'Viewed Audit Logs','2025-11-23 20:05:32','::1',NULL),(88,3,'Viewed Admin Dashboard','2025-11-23 20:28:20','::1',NULL),(89,3,'Viewed Manage Users page','2025-11-23 20:28:22','::1',NULL),(90,3,'Viewed Audit Logs','2025-11-23 20:28:23','::1',NULL),(91,7,'Viewed Audit Logs','2025-11-23 20:28:44','::1',NULL),(92,3,'Viewed Admin Dashboard','2025-11-23 20:39:43','::1',NULL),(93,3,'Viewed Manage Users page','2025-11-23 20:39:56','::1',NULL),(94,3,'Viewed Audit Logs','2025-11-23 20:39:58','::1',NULL),(95,7,'Viewed Audit Logs','2025-11-23 20:40:07','::1',NULL),(96,3,'Viewed Admin Dashboard','2025-11-23 20:45:26','::1',NULL),(97,3,'Viewed Manage Users page','2025-11-23 20:45:27','::1',NULL),(98,3,'Viewed Audit Logs','2025-11-23 20:45:28','::1',NULL),(99,3,'Viewed Admin Dashboard','2025-11-23 20:49:54','::1',NULL),(100,3,'Viewed Manage Users page','2025-11-23 20:49:55','::1',NULL),(101,3,'Viewed Admin Dashboard','2025-11-23 20:52:50','::1',NULL),(102,3,'Viewed Manage Users page','2025-11-23 20:52:52','::1',NULL),(103,3,'User logged in','2025-11-23 21:00:27','::1',NULL),(104,3,'Viewed Admin Dashboard','2025-11-23 21:00:27','::1',NULL),(105,3,'Viewed Manage Users page','2025-11-23 21:00:29','::1',NULL),(106,7,'User logged in','2025-11-23 21:00:34','::1',NULL),(107,3,'User logged in','2025-12-23 20:08:46','::1',NULL),(108,3,'Viewed Admin Dashboard','2025-12-23 20:08:46','::1',NULL),(109,3,'Viewed Manage Users page','2025-12-23 20:08:49','::1',NULL),(110,3,'Created new user: supervisor1','2025-12-23 20:11:00','::1',NULL),(111,3,'Viewed Manage Users page','2025-12-23 20:11:00','::1',NULL),(112,3,'Viewed Admin Dashboard','2025-12-23 20:20:53','::1',NULL),(113,8,'User logged in','2025-12-23 20:21:03','::1',NULL),(114,8,'Approved evidence ID: 6','2025-12-23 20:43:01','::1',NULL),(115,3,'User logged in','2025-12-23 20:44:17','::1',NULL),(116,3,'Viewed Admin Dashboard','2025-12-23 20:44:17','::1',NULL),(117,3,'Viewed Manage Users page','2025-12-23 20:44:19','::1',NULL),(118,8,'User logged in','2025-12-24 12:54:46','::1',NULL),(119,8,'Viewed Supervisor Dashboard','2025-12-24 12:54:46','::1',NULL),(120,8,'User logged in','2025-12-24 13:00:56','::1',NULL),(121,8,'User logged in','2025-12-24 14:12:44','::1',NULL),(122,8,'User logged in','2025-12-24 21:14:03','::1',NULL),(123,8,'User logged in','2025-12-24 21:28:14','::1',NULL),(124,8,'User logged in','2025-12-24 21:38:22','::1',NULL),(125,8,'User logged in','2025-12-24 22:13:00','::1',NULL),(126,7,'User logged in','2025-12-24 22:13:23','::1',NULL),(127,7,'Added evidence ID: 7','2025-12-24 22:14:12','::1',NULL),(128,8,'User logged in','2025-12-24 22:14:38','::1',NULL),(129,8,'User logged in','2025-12-24 23:51:35','::1',NULL),(130,8,'User logged in','2025-12-25 00:32:35','::1',NULL),(131,7,'User logged in','2025-12-25 22:20:35','::1',NULL),(132,7,'User logged in','2025-12-26 09:08:07','::1',NULL),(133,7,'User logged in','2025-12-26 09:14:11','::1',NULL),(134,7,'User logged in','2025-12-26 09:20:16','::1',NULL),(135,7,'User logged in','2025-12-26 09:45:57','::1',NULL),(136,7,'User logged in','2025-12-26 11:40:26','::1',NULL),(137,3,'User logged in','2025-12-27 16:38:25','::1',NULL),(138,3,'Viewed Admin Dashboard','2025-12-27 16:38:25','::1',NULL),(139,3,'Viewed Manage Users page','2025-12-27 16:38:28','::1',NULL),(140,3,'Viewed Admin Dashboard','2025-12-27 16:38:45','::1',NULL),(141,3,'Viewed Manage Users page','2025-12-27 16:38:47','::1',NULL),(142,3,'Created new user: analyst1','2025-12-27 16:40:26','::1',NULL),(143,3,'Viewed Manage Users page','2025-12-27 16:40:26','::1',NULL),(144,9,'User logged in','2025-12-27 16:40:52','::1',NULL),(145,9,'User logged in','2025-12-27 22:20:55','::1',NULL),(146,9,'User logged in','2025-12-28 01:02:06','::1',NULL),(147,9,'User logged in','2025-12-28 01:03:55','::1',NULL),(148,9,'User logged in','2025-12-28 03:16:12','::1',NULL),(149,9,'User logged in','2025-12-28 14:36:08','::1',NULL),(150,9,'User logged in','2025-12-28 14:58:06','::1',NULL),(151,9,'User logged in','2025-12-28 15:15:32','::1',NULL),(152,9,'User logged in','2025-12-28 15:18:36','::1',NULL),(153,9,'User logged in','2025-12-28 15:45:27','::1',NULL),(154,9,'User logged in','2025-12-28 20:13:43','::1',NULL),(155,3,'User logged in','2025-12-28 20:40:22','::1',NULL),(156,3,'Viewed Admin Dashboard','2025-12-28 20:40:22','::1',NULL),(157,3,'Viewed Manage Users page','2025-12-28 20:40:23','::1',NULL),(158,3,'Created new user: prosecutor1','2025-12-28 20:43:07','::1',NULL),(159,3,'Viewed Manage Users page','2025-12-28 20:43:07','::1',NULL),(160,10,'User logged in','2025-12-28 20:43:33','::1',NULL),(161,3,'User logged in','2025-12-28 20:45:53','::1',NULL),(162,3,'Viewed Admin Dashboard','2025-12-28 20:45:53','::1',NULL),(163,3,'Viewed Manage Users page','2025-12-28 20:45:54','::1',NULL),(164,10,'User logged in','2025-12-28 20:46:13','::1',NULL),(165,10,'User logged in','2025-12-28 20:50:13','::1',NULL),(166,10,'User logged in','2025-12-28 21:58:27','::1',NULL),(167,10,'User logged in','2025-12-28 22:07:37','::1',NULL),(168,10,'User logged in','2025-12-28 22:28:18','::1',NULL),(169,10,'User logged in','2025-12-28 22:43:39','::1',NULL),(170,10,'User logged in','2025-12-28 23:44:46','::1',NULL),(171,3,'User logged in','2025-12-30 10:57:25','::1',NULL),(172,3,'Viewed Admin Dashboard','2025-12-30 10:57:25','::1',NULL),(173,3,'Viewed Manage Users page','2025-12-30 10:57:31','::1',NULL),(174,3,'User logged in','2025-12-30 17:51:35','::1',NULL),(175,3,'Viewed Admin Dashboard','2025-12-30 17:51:35','::1',NULL),(176,3,'Viewed Manage Users page','2025-12-30 17:51:38','::1',NULL),(177,3,'USER_LOGIN','2025-12-31 02:24:00','::1','Role: administrator'),(178,7,'USER_LOGIN','2026-01-08 22:48:56','::1','Role: investigator'),(179,7,'USER_LOGIN','2026-01-08 23:07:20','::1','Role: investigator'),(180,7,'EVIDENCE_REGISTERED','2026-01-08 23:12:28','::1','Evidence ID 9 registered and blockchain anchored'),(181,8,'USER_LOGIN','2026-01-08 23:14:50','::1','Role: supervisor'),(182,8,'USER_LOGIN','2026-01-08 23:42:15','::1','Role: supervisor'),(183,8,'EVIDENCE_APPROVED','2026-01-08 23:44:49','::1','Evidence ID 9. Notes: Evidence checked. USB connector intact. Properly collected and logged. Approved for forensic analysis.'),(184,7,'USER_LOGIN','2026-01-09 00:00:29','::1','Role: investigator'),(185,7,'USER_LOGIN','2026-01-10 09:33:52','::1','Role: investigator'),(186,7,'EVIDENCE_TRANSFERRED_TO_ANALYST','2026-01-10 09:34:50','::1','Evidence ID 9 transferred to Analyst ID 9'),(187,7,'USER_LOGIN','2026-01-10 10:23:22','::1','Role: investigator'),(188,7,'USER_LOGIN','2026-01-10 11:02:48','::1','Role: investigator'),(189,9,'USER_LOGIN','2026-01-10 11:24:55','::1','Role: analyst'),(190,9,'USER_LOGIN','2026-01-10 20:06:07','::1','Role: analyst'),(191,9,'USER_LOGIN','2026-01-10 20:24:29','::1','Role: analyst'),(192,9,'USER_LOGIN','2026-01-10 20:34:40','::1','Role: analyst'),(193,9,'USER_LOGIN','2026-01-10 23:51:44','::1','Role: analyst'),(194,9,'USER_LOGIN','2026-01-11 01:17:11','::1','Role: analyst'),(195,9,'USER_LOGIN','2026-01-11 01:22:10','::1','Role: analyst'),(196,9,'FORENSIC_ANALYSIS_RECORDED','2026-01-11 01:42:58','::1','Evidence 9'),(197,9,'USER_LOGIN','2026-01-11 02:00:29','::1','Role: analyst'),(198,9,'USER_LOGIN','2026-01-11 09:23:30','::1','Role: analyst'),(199,9,'USER_LOGIN','2026-01-11 10:40:43','::1','Role: analyst'),(200,9,'USER_LOGIN','2026-01-11 11:37:30','::1','Role: analyst'),(201,9,'USER_LOGIN','2026-01-11 16:32:24','::1','Role: analyst'),(202,9,'USER_LOGIN','2026-01-11 16:38:25','::1','Role: analyst'),(203,9,'USER_LOGIN','2026-01-11 17:01:11','::1','Role: analyst'),(204,7,'USER_LOGIN','2026-01-11 17:02:47','::1','Role: investigator'),(205,7,'EVIDENCE_REGISTERED','2026-01-11 17:07:16','::1','Evidence ID 10 registered and blockchain anchored'),(206,9,'USER_LOGIN','2026-01-12 05:06:34','::1','Role: analyst'),(207,8,'USER_LOGIN','2026-01-12 05:07:04','::1','Role: supervisor'),(208,8,'EVIDENCE_APPROVED','2026-01-12 05:12:47','::1','Evidence ID 10. Notes: Supervisor approval granted. Proceed with forensic imaging and analysis.'),(209,7,'USER_LOGIN','2026-01-12 05:16:16','::1','Role: investigator'),(210,7,'EVIDENCE_TRANSFERRED_TO_ANALYST','2026-01-12 05:18:48','::1','Evidence ID 10 transferred to Analyst ID 9'),(211,9,'USER_LOGIN','2026-01-12 05:23:22','::1','Role: analyst'),(212,9,'USER_LOGIN','2026-01-12 05:37:34','::1','Role: analyst'),(213,9,'USER_LOGIN','2026-01-12 05:46:56','::1','Role: analyst'),(214,9,'USER_LOGIN','2026-01-12 21:20:52','::1','Role: analyst'),(215,9,'USER_LOGIN','2026-01-12 22:44:57','::1','Role: analyst'),(216,9,'USER_LOGIN','2026-01-12 23:20:57','::1','Role: analyst'),(217,9,'USER_LOGIN','2026-01-13 03:37:41','::1','Role: analyst'),(218,9,'USER_LOGIN','2026-01-13 14:32:19','::1','Role: analyst'),(219,9,'USER_LOGIN','2026-01-13 15:49:38','::1','Role: analyst'),(220,9,'USER_LOGIN','2026-01-13 15:57:15','::1','Role: analyst'),(221,9,'USER_LOGIN','2026-01-13 16:24:08','::1','Role: analyst'),(222,9,'USER_LOGIN','2026-01-13 19:33:59','::1','Role: analyst'),(223,9,'USER_LOGIN','2026-01-13 19:51:05','::1','Role: analyst'),(224,9,'USER_LOGIN','2026-01-13 20:26:25','::1','Role: analyst'),(225,9,'USER_LOGIN','2026-01-13 20:27:27','::1','Role: analyst'),(226,9,'USER_LOGIN','2026-01-13 20:45:02','::1','Role: analyst'),(227,7,'USER_LOGIN','2026-01-13 20:53:38','::1','Role: investigator'),(228,7,'EVIDENCE_REGISTERED','2026-01-13 20:56:47','::1','Evidence ID 11 registered and blockchain anchored'),(229,8,'USER_LOGIN','2026-01-13 20:57:04','::1','Role: supervisor'),(230,8,'EVIDENCE_APPROVED','2026-01-13 20:58:48','::1','Evidence ID 11. Notes: - Evidence received in sealed condition.\r\n- No visible tampering detected.\r\n- Imaging process approved for lab analysis.'),(231,7,'USER_LOGIN','2026-01-13 20:59:08','::1','Role: investigator'),(232,7,'EVIDENCE_TRANSFERRED_TO_ANALYST','2026-01-13 20:59:51','::1','Evidence ID 11 transferred to Analyst ID 9'),(233,9,'USER_LOGIN','2026-01-13 21:00:03','::1','Role: analyst'),(234,9,'USER_LOGIN','2026-01-13 21:35:15','::1','Role: analyst'),(235,9,'USER_LOGIN','2026-01-13 22:22:28','::1','Role: analyst'),(236,7,'USER_LOGIN','2026-01-13 22:23:11','::1','Role: investigator'),(237,7,'EVIDENCE_REGISTERED','2026-01-13 22:25:03','::1','Evidence ID 12 registered and blockchain anchored'),(238,8,'USER_LOGIN','2026-01-13 22:26:37','::1','Role: supervisor'),(239,8,'EVIDENCE_APPROVED','2026-01-13 22:27:35','::1','Evidence ID 12. Notes: - Evidence received in sealed condition.\r\n\r\n- No visible tampering detected.\r\n\r\n- Imaging process approved for lab analysis.'),(240,7,'USER_LOGIN','2026-01-13 22:27:46','::1','Role: investigator'),(241,7,'EVIDENCE_TRANSFERRED_TO_ANALYST','2026-01-13 22:28:02','::1','Evidence ID 12 transferred to Analyst ID 9'),(242,9,'USER_LOGIN','2026-01-13 22:28:16','::1','Role: analyst'),(243,9,'USER_LOGIN','2026-01-13 23:23:59','::1','Role: analyst'),(244,9,'USER_LOGIN','2026-01-13 23:42:44','::1','Role: analyst'),(245,9,'USER_LOGIN','2026-01-14 16:09:37','::1','Role: analyst'),(246,9,'Transferred evidence to prosecutor','2026-01-14 16:10:27','::1','Evidence ID 12, Signature 9e662db676b22922d0925c509d700e0d956ef97dbc4c82b60de0e2c2e0e7447e'),(247,3,'USER_LOGIN','2026-01-14 16:16:20','::1','Role: administrator'),(248,10,'USER_LOGIN','2026-01-14 16:16:52','::1','Role: prosecutor'),(249,10,'Exported Chain of Custody PDF','2026-01-14 16:17:23','::1','Evidence ID 12'),(250,10,'USER_LOGIN','2026-01-15 15:56:47','::1','Role: prosecutor'),(251,10,'USER_LOGIN','2026-01-15 17:38:05','::1','Role: prosecutor'),(252,10,'Exported Chain of Custody PDF','2026-01-15 17:38:10','::1','Evidence ID 12'),(253,10,'Exported Chain of Custody PDF','2026-01-15 17:38:17','::1','Evidence ID 12'),(254,10,'USER_LOGIN','2026-01-15 17:39:03','::1','Role: prosecutor'),(255,10,'Exported Chain of Custody PDF','2026-01-15 17:39:07','::1','Evidence ID 12'),(256,3,'USER_LOGIN','2026-01-20 00:29:19','::1','Role: administrator'),(257,3,'USER_LOGOUT','2026-01-20 00:29:48','::1',NULL),(258,7,'USER_LOGIN','2026-01-20 00:29:54','::1','Role: investigator'),(259,3,'USER_LOGIN','2026-01-20 00:37:50','::1','Role: administrator'),(260,3,'USER_UPDATED','2026-01-20 00:38:13','::1','User ID: 3, Username: admin1, Role: administrator'),(261,3,'USER_LOGOUT','2026-01-20 00:38:25','::1',NULL),(262,7,'USER_LOGIN','2026-01-20 00:38:32','::1','Role: investigator'),(263,7,'EVIDENCE_REGISTERED','2026-01-20 00:39:50','::1','Evidence ID 13 registered and blockchain anchored'),(264,3,'USER_LOGIN','2026-01-20 00:41:38','::1','Role: administrator'),(265,3,'USER_UPDATED','2026-01-20 00:41:54','::1','User ID: 3, Username: admin12, Role: administrator'),(266,3,'USER_LOGOUT','2026-01-20 00:42:04','::1',NULL),(267,7,'USER_LOGIN','2026-01-20 00:43:41','::1','Role: investigator'),(268,8,'USER_LOGIN','2026-01-20 00:47:03','::1','Role: supervisor'),(269,8,'USER_LOGIN','2026-01-20 00:53:29','::1','Role: supervisor'),(270,8,'EVIDENCE_REJECTED','2026-01-20 00:54:08','::1','Evidence ID 13. Reason: Packaging seal not verified. Evidence rejected pending correction and resubmission'),(271,7,'USER_LOGIN','2026-01-20 00:54:50','::1','Role: investigator'),(272,7,'USER_LOGIN','2026-01-20 01:28:24','::1','Role: investigator'),(273,7,'USER_LOGIN','2026-01-20 01:31:04','::1','Role: investigator'),(274,7,'USER_LOGIN','2026-01-20 01:56:22','::1','Role: investigator'),(275,7,'USER_LOGIN','2026-01-20 05:03:41','::1','Role: investigator'),(276,7,'USER_LOGIN','2026-01-20 05:15:07','::1','Role: investigator'),(277,7,'EVIDENCE_RESUBMITTED','2026-01-20 05:15:27','::1','Evidence ID 13 resubmitted after rejection'),(278,8,'USER_LOGIN','2026-01-20 05:16:18','::1','Role: supervisor'),(279,8,'USER_LOGIN','2026-01-20 05:19:01','::1','Role: supervisor'),(280,8,'EVIDENCE_REJECTED','2026-01-20 05:19:40','::1','Evidence ID 13. Reason: Give complete description for the evidence'),(281,9,'USER_LOGIN','2026-01-20 05:31:02','::1','Role: analyst'),(282,10,'USER_LOGIN','2026-01-20 05:32:29','::1','Role: prosecutor'),(283,10,'USER_LOGIN','2026-01-20 20:23:52','::1','Role: prosecutor'),(284,3,'USER_LOGIN','2026-01-20 22:45:06','::1','Role: administrator'),(285,3,'USER_LOGIN','2026-01-20 23:19:51','::1','Role: administrator'),(286,3,'USER_LOGIN','2026-01-21 02:31:19','::1','Role: administrator'),(287,3,'USER_LOGIN','2026-01-21 03:02:09','::1','Role: administrator'),(288,3,'USER_LOGIN','2026-01-21 03:43:37','::1','Role: administrator'),(289,3,'USER_LOGIN','2026-01-21 03:44:56','::1','Role: administrator'),(290,3,'DATABASE_BACKUP_CREATED','2026-01-21 03:45:01','::1','Backup file: backup_1768967099800.sql');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_logs`
--

DROP TABLE IF EXISTS `backup_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_logs` (
  `backup_id` int NOT NULL AUTO_INCREMENT,
  `backup_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`backup_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `backup_logs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_logs`
--

LOCK TABLES `backup_logs` WRITE;
/*!40000 ALTER TABLE `backup_logs` DISABLE KEYS */;
INSERT INTO `backup_logs` VALUES (1,'backup_1768967099800.sql','2026-01-21 03:45:01',3);
/*!40000 ALTER TABLE `backup_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evidence`
--

DROP TABLE IF EXISTS `evidence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidence` (
  `evidence_id` int NOT NULL AUTO_INCREMENT,
  `case_id` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `timestamp_collected` datetime NOT NULL,
  `collected_by` int DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `current_status` enum('pending_supervisor','approved_supervisor','rejected_supervisor','final_signed','transferred_to_lab','report_uploaded','completed') DEFAULT NULL,
  `initial_hash` varchar(64) DEFAULT NULL,
  `final_hash` varchar(64) DEFAULT NULL,
  `supervisor_reason` text,
  `supervisor_notes` text,
  PRIMARY KEY (`evidence_id`),
  KEY `collected_by` (`collected_by`),
  CONSTRAINT `evidence_ibfk_1` FOREIGN KEY (`collected_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evidence`
--

LOCK TABLES `evidence` WRITE;
/*!40000 ALTER TABLE `evidence` DISABLE KEYS */;
INSERT INTO `evidence` VALUES (6,'CASE-0001','sealed phone','2025-11-23 10:36:47',7,'uploads\\evidence_photos\\1763894207085.jpg','approved_supervisor','a69cd06380a84cbf333bf556d806e878f727016ca3173e3b71bc303456b5d99b',NULL,NULL,NULL),(7,'CASE-0002','Burned Hard disk','2025-12-24 22:14:12',7,'uploads\\evidence_photos\\1766614452608.jpg','pending_supervisor','6bf7f343f2de6dc95251d24097a07ca9b1bc106db4f16379e0c9ca2e88e26911',NULL,NULL,NULL),(8,'CASE-0003','Damaged Hard drive ','2026-01-08 22:52:18',7,'uploads\\evidence_photos\\1767912738785.jpg','pending_supervisor','280095dca3053ba64a0c0037dd284a3e20d86555492eba206d81ac5ee083f19e',NULL,NULL,NULL),(9,'CASE-0004','Intact USB connector','2026-01-08 23:12:11',7,'uploads\\evidence_photos\\1767913931592.png','report_uploaded','b597178a571084d2d1126415e0061bf62926e154b6c1334bf47f0b887c637fc7',NULL,NULL,'Evidence checked. USB connector intact. Properly collected and logged. Approved for forensic analysis.'),(10,'CASE-0005','Black Samsung Galaxy S21 recovered from suspect’s vehicle. Device suspected to contain WhatsApp messages and call logs relevant to the investigation.','2026-01-11 17:07:01',7,'uploads\\evidence_photos\\1768151221077.jpg','report_uploaded','d200620b0a263a18bc691bc388e23a7a9e4d11863b2cff07c95f65d3566575ab',NULL,NULL,'Supervisor approval granted. Proceed with forensic imaging and analysis.'),(11,'CASE-0006',' External Seagate 1TB Hard Disk recovered from suspect’s office desk. Suspected to contain CCTV footage backups related to the investigation.','2026-01-13 20:56:32',7,'uploads\\evidence_photos\\1768337792490.jpg','transferred_to_lab','4016309c94bf20fc9b4e54ad3eaccec5e790123c0a48101788798740ae24d47b',NULL,NULL,'- Evidence received in sealed condition.\r\n- No visible tampering detected.\r\n- Imaging process approved for lab analysis.'),(12,'CASE-0007','Apple MacBook Pro (13-inch, Silver) seized from suspect’s home office. Suspected to contain browsing history and email records relevant to the investigation.','2026-01-13 22:24:37',7,'uploads\\evidence_photos\\1768343077214.jpg','completed','74b22149b7cf6399625cb633d8ac8bf053a0be73e20c7a6422ed00e84e1409a4',NULL,NULL,'- Evidence received in sealed condition.\r\n\r\n- No visible tampering detected.\r\n\r\n- Imaging process approved for lab analysis.'),(13,'CASE-0008','Kingston 32GB USB Flash Drive recovered from suspect\'s backpack.\r\n    ','2026-01-20 00:39:38',7,'uploads\\evidence_photos\\1768869578233.jpg','rejected_supervisor','e18cbc70efcdf9005357e36738a4e3faf5277f753bc25522c88fa281de72dac6',NULL,'Give complete description for the evidence',NULL);
/*!40000 ALTER TABLE `evidence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evidence_chain`
--

DROP TABLE IF EXISTS `evidence_chain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidence_chain` (
  `block_id` int NOT NULL AUTO_INCREMENT,
  `evidence_id` int DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `actor_id` int DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_hash` varchar(64) DEFAULT NULL,
  `previous_hash` varchar(64) DEFAULT NULL,
  `tx_hash` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`block_id`),
  KEY `evidence_id` (`evidence_id`),
  KEY `actor_id` (`actor_id`),
  CONSTRAINT `evidence_chain_ibfk_1` FOREIGN KEY (`evidence_id`) REFERENCES `evidence` (`evidence_id`),
  CONSTRAINT `evidence_chain_ibfk_2` FOREIGN KEY (`actor_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evidence_chain`
--

LOCK TABLES `evidence_chain` WRITE;
/*!40000 ALTER TABLE `evidence_chain` DISABLE KEYS */;
INSERT INTO `evidence_chain` VALUES (3,6,'Evidence Collected',7,'2025-11-23 10:36:47','a69cd06380a84cbf333bf556d806e878f727016ca3173e3b71bc303456b5d99b','',NULL),(4,6,'Approved by Supervisor',8,'2025-12-23 20:43:01','c67faeb91041ae2c5d9e5a7a0acb49d97cabc70de70b5e077b92c960be85077e','',NULL),(5,7,'Evidence Collected',7,'2025-12-24 22:14:12','6bf7f343f2de6dc95251d24097a07ca9b1bc106db4f16379e0c9ca2e88e26911','',NULL),(6,8,'Evidence Collected',7,'2026-01-08 22:52:18','280095dca3053ba64a0c0037dd284a3e20d86555492eba206d81ac5ee083f19e','',NULL),(7,9,'Evidence Collected',7,'2026-01-08 23:12:28','b597178a571084d2d1126415e0061bf62926e154b6c1334bf47f0b887c637fc7',NULL,'0xdb006c84d8e38b10a135045d224e486b93dbd38c4edfdf1ce51f32abe86b5c8e'),(8,9,'Approved by Supervisor',8,'2026-01-08 23:44:49','d2f0b78eb43bd5955015c288099c7462fcdda456d741c184132acc2a258bb953',NULL,'0x49d83ea7fe66e28a823f334ee3c8661cd4308d0c1d62cf361a0eb0039c048b16'),(9,9,'Transferred to Analyst',7,'2026-01-10 09:34:50','8fcbcd0b9e6c8f40df413f5e1b02547f7d0d58c18bd76fe73fc1593686d6eee0',NULL,'0xdda7526243d8653314197e7f505eeeb5e5724215340751a18f3b78919d453aa1'),(10,9,'Forensic Analysis Recorded',9,'2026-01-11 01:42:58','958fd4f0b58cc169dc7bf4420bf9cd6690b75529f66910e2287360dc6212c21f','',NULL),(11,9,'Forensic Report Finalized',9,'2026-01-11 11:38:24','499663c3b518a5d6b9e08ed5795e4977ce58bf418e0b2c60a4813d43b7a5329d',NULL,'0xf951b8d133a91d1aac9b5e438bf01cf7b71ad6a065d4353dcd7d32debe8a9f7d'),(12,10,'Evidence Collected',7,'2026-01-11 17:07:16','d200620b0a263a18bc691bc388e23a7a9e4d11863b2cff07c95f65d3566575ab',NULL,'0xd3fbf4874e45f92c2d9a324544917b7f6cb93098798ab97554979cff2e93a264'),(13,10,'Approved by Supervisor',8,'2026-01-12 05:12:47','5b122f4b0fbb1667085c5680f39988cf99edb29a56321d052ffc5057455dbf18',NULL,'0xe1d7e2f485c1e84b01c506f18f1c136c48e66fc8c9f0274aee81fb22999ac421'),(14,10,'Transferred to Analyst',7,'2026-01-12 05:18:48','211ac2a8c32dc6f82fd9aa0d01b4947f848a63024c0b40ddae6e68b8ca9e4a10',NULL,'0x0dd841fc19e89ac920d721a34a2197cd834bc1920b9394fdeccf5b451ef9474c'),(15,11,'Evidence Collected',7,'2026-01-13 20:56:47','4016309c94bf20fc9b4e54ad3eaccec5e790123c0a48101788798740ae24d47b',NULL,'0x40bf8167cbe140bf5d5463d753609c90a22e39a4e927cdbc5a7e49e266c9f45a'),(16,11,'Approved by Supervisor',8,'2026-01-13 20:58:48','a20ba8bfed683506555cf2ecd29b32aab64d024482c6f0d72288d17744482ba1',NULL,'0x2bb1aa6a4e7a3411a54fee4d480562099bac856bd7383216d21ac4a5e38859b0'),(17,11,'Transferred to Analyst',7,'2026-01-13 20:59:51','822fbbbf09e9565744c4aa5c1de9c0a66a29f3e2b93fbdd536b6837d3fd8fbd3',NULL,'0x1a5b6396c0b19fe3d07143bd0246c9e297cdce0c76b8f33c3a157775575e9531'),(18,12,'Evidence Collected',7,'2026-01-13 22:25:03','74b22149b7cf6399625cb633d8ac8bf053a0be73e20c7a6422ed00e84e1409a4',NULL,'0x8effceaaf36f7ed1f56b59b45d91e738a1ba35f1030ce638ea569f22455afe59'),(19,12,'Approved by Supervisor',8,'2026-01-13 22:27:35','fa3b4b81bbff254804f94310ffdc142b45e804ac3fecc459de8f2c0959e87714',NULL,'0x825db74b94d1887e2b507b4370a8715ae692f37dec41d9c5d268bd96fa75c16d'),(20,12,'Transferred to Analyst',7,'2026-01-13 22:28:02','5b73d1cf501f7e8bd04af2ffaf9f370400436c1691240d525c5b89040a73a275',NULL,'0x51a45bba7657ff516c959cdba28d338de147c5cb380ab397c29b57c50a8c87aa'),(21,12,'Forensic Report Finalized',9,'2026-01-13 22:30:49','895444768cff460bde6daf345eac25733a65833b0e29d56a97692ad60b4e7c46',NULL,'0xecae736373683b514b3fcebc3487b164a00450c48301baa75622585a7c83ec79'),(22,12,'Transferred to Prosecutor',9,'2026-01-14 16:10:27','9e662db676b22922d0925c509d700e0d956ef97dbc4c82b60de0e2c2e0e7447e',NULL,'0x9feaac562e91b403f1e776447223685a6ece029ebff55af43390da015554a50f'),(23,13,'Evidence Collected',7,'2026-01-20 00:39:50','e18cbc70efcdf9005357e36738a4e3faf5277f753bc25522c88fa281de72dac6',NULL,'0x5eedf089b3c18576fcfa9996e65266aac95a147e28a04c13b091f701b71218f2');
/*!40000 ALTER TABLE `evidence_chain` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forensic_analysis`
--

DROP TABLE IF EXISTS `forensic_analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forensic_analysis` (
  `analysis_id` int NOT NULL AUTO_INCREMENT,
  `evidence_id` int NOT NULL,
  `analyst_id` int NOT NULL,
  `tools_used` text,
  `methodology` text,
  `observations` text,
  `conclusion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_finalized` tinyint DEFAULT '0',
  PRIMARY KEY (`analysis_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forensic_analysis`
--

LOCK TABLES `forensic_analysis` WRITE;
/*!40000 ALTER TABLE `forensic_analysis` DISABLE KEYS */;
INSERT INTO `forensic_analysis` VALUES (1,10,9,'Cellebrite UFED (mobile data extraction)\r\n\r\nAutopsy (analysis of extracted files)\r\n\r\nWrite-blocker setup for imaging','Device powered on in controlled lab environment.\r\n\r\nLogical extraction performed using UFED.','WhatsApp database successfully extracted.\r\n\r\nCall logs show 15 outgoing calls between Jan 05–Jan 08, 2026.','Evidence integrity preserved during acquisition.\r\n\r\nExtracted data is relevant to Case CASE-0005.\r\n\r\nChain of custody maintained in line with Malaysian Forensic SOPs.\r\n\r\nDevice contents transferred securely to lab repository for further analysis.','2026-01-12 23:23:22','2026-01-13 20:43:34',0),(2,11,9,'- FTK Imager (disk imaging)\r\n- X-Ways Forensics (file system analysis)\r\n- Write-blocker hardware\r\n\r\n','- Hard disk imaged using FTK Imager in a controlled lab environment.\r\n- Extracted image mounted in X-Ways for review.\r\n- Integrity verified with SHA-256 hash values.','- Drive contained 5 folders and 32 video files.\r\n- CCTV footage dated Jan 05–Jan 08, 2026 recovered.','- Evidence integrity preserved during acquisition and analysis.\r\n- CCTV footage relevant to Case CASE-0006.\r\n- Chain of custody maintained according to Malaysian Forensic SOPs.\r\n- Hard disk contents securely transferred to lab repository for further examination.','2026-01-13 21:02:33','2026-01-13 21:02:54',1),(3,12,9,'- FTK Imager (disk imaging)\r\n\r\n- Autopsy (browser history and email analysis)','- Laptop imaged using FTK Imager.\r\n\r\n- Extracted data imported into Autopsy for review.\r\n\r\n- Integrity verified with SHA-256 hash values.','- Browser history shows multiple visits to encrypted email services.\r\n\r\n- Email client contained 25 messages exchanged between Jan 05–Jan 10, 2026.\r\n\r\n- One deleted email successfully recovered.','- Evidence integrity preserved during acquisition.\r\n\r\n- Extracted data relevant to Case CASE-0007.\r\n\r\n- Chain of custody maintained according to Malaysian Forensic SOPs.','2026-01-13 22:30:19','2026-01-13 22:30:28',1);
/*!40000 ALTER TABLE `forensic_analysis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forensic_reports`
--

DROP TABLE IF EXISTS `forensic_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forensic_reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `evidence_id` int NOT NULL,
  `analyst_id` int NOT NULL,
  `report_file_path` varchar(255) NOT NULL,
  `report_hash` varchar(64) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `fk_report_evidence` (`evidence_id`),
  KEY `fk_report_analyst` (`analyst_id`),
  CONSTRAINT `fk_report_analyst` FOREIGN KEY (`analyst_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_report_evidence` FOREIGN KEY (`evidence_id`) REFERENCES `evidence` (`evidence_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forensic_reports`
--

LOCK TABLES `forensic_reports` WRITE;
/*!40000 ALTER TABLE `forensic_reports` DISABLE KEYS */;
INSERT INTO `forensic_reports` VALUES (1,12,9,'uploads/reports/report_12.pdf','895444768cff460bde6daf345eac25733a65833b0e29d56a97692ad60b4e7c46','2026-01-13 22:30:29');
/*!40000 ALTER TABLE `forensic_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfers`
--

DROP TABLE IF EXISTS `transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfers` (
  `transfer_id` int NOT NULL AUTO_INCREMENT,
  `evidence_id` int DEFAULT NULL,
  `sender_id` int DEFAULT NULL,
  `receiver_id` int DEFAULT NULL,
  `transfer_type` enum('to_supervisor','to_lab','to_prosecutor') DEFAULT NULL,
  `transfer_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `signature_hash` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`transfer_id`),
  KEY `evidence_id` (`evidence_id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `transfers_ibfk_1` FOREIGN KEY (`evidence_id`) REFERENCES `evidence` (`evidence_id`),
  CONSTRAINT `transfers_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `transfers_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfers`
--

LOCK TABLES `transfers` WRITE;
/*!40000 ALTER TABLE `transfers` DISABLE KEYS */;
INSERT INTO `transfers` VALUES (1,9,7,9,'to_lab','2026-01-10 09:34:31','8fcbcd0b9e6c8f40df413f5e1b02547f7d0d58c18bd76fe73fc1593686d6eee0'),(2,10,7,9,'to_lab','2026-01-12 05:18:04','211ac2a8c32dc6f82fd9aa0d01b4947f848a63024c0b40ddae6e68b8ca9e4a10'),(3,11,7,9,'to_lab','2026-01-13 20:59:19','822fbbbf09e9565744c4aa5c1de9c0a66a29f3e2b93fbdd536b6837d3fd8fbd3'),(4,12,7,9,'to_lab','2026-01-13 22:27:50','5b73d1cf501f7e8bd04af2ffaf9f370400436c1691240d525c5b89040a73a275'),(5,12,9,10,'to_prosecutor','2026-01-14 16:10:15','9e662db676b22922d0925c509d700e0d956ef97dbc4c82b60de0e2c2e0e7447e');
/*!40000 ALTER TABLE `transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('administrator','investigator','supervisor','analyst','prosecutor') NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'admin12','$2b$10$XckheJKdNirOHkXZ8uiU2u3VfJ4/k7KGjrcFPQTuJ5UOOz61LJMy6','administrator','System Administrator','2025-11-20 12:18:54'),(7,'investigator1','$2b$10$i0FShlGYMBX7PUzjnQVhAejbPNp0sEHem/2Yn4Vt2UgW3kX9JigGK','investigator','Taarsinii','2025-11-22 14:59:13'),(8,'supervisor1','$2b$10$CiBpxwoxBjR5nz7F5GXIqu0ob/pUYfT95uRzgeYw.0G5WSfFUW7hS','supervisor','Kristy','2025-12-23 20:11:00'),(9,'analyst1','$2b$10$CFk9X3Lze.jyssccpECLyeM11v.9d5Du44OlkGAmzFpTcvyYk0vPO','analyst','John Doe','2025-12-27 16:40:25'),(10,'prosecutor1','$2b$10$IZCcclEYiuFi7VmQR0kyhOJT9rlcIoxb8pZ6oQlUpoSD7glAZv9zW','prosecutor','Nelson ','2025-12-28 20:43:07');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-21 11:45:05
