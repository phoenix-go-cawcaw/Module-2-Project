-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: modern_tech
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `attendance_id` int unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` int unsigned NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('Present','Absent') NOT NULL,
  PRIMARY KEY (`attendance_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_info` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,1,'2025-07-25','Present'),(2,1,'2025-07-26','Absent'),(3,1,'2025-07-27','Present'),(4,1,'2025-07-28','Present'),(5,1,'2025-07-29','Present'),(6,2,'2025-07-25','Present'),(7,2,'2025-07-26','Present'),(8,2,'2025-07-27','Absent'),(9,2,'2025-07-28','Present'),(10,2,'2025-07-29','Present'),(11,3,'2025-07-25','Present'),(12,3,'2025-07-26','Present'),(13,3,'2025-07-27','Present'),(14,3,'2025-07-28','Absent'),(15,3,'2025-07-29','Present'),(16,4,'2025-07-25','Absent'),(17,4,'2025-07-26','Present'),(18,4,'2025-07-27','Present'),(19,4,'2025-07-28','Present'),(20,4,'2025-07-29','Present'),(21,5,'2025-07-25','Present'),(22,5,'2025-07-26','Present'),(23,5,'2025-07-27','Absent'),(24,5,'2025-07-28','Present'),(25,5,'2025-07-29','Present'),(26,6,'2025-07-25','Present'),(27,6,'2025-07-26','Present'),(28,6,'2025-07-27','Absent'),(29,6,'2025-07-28','Present'),(30,6,'2025-07-29','Present'),(31,7,'2025-07-25','Present'),(32,7,'2025-07-26','Present'),(33,7,'2025-07-27','Present'),(34,7,'2025-07-28','Absent'),(35,7,'2025-07-29','Present'),(36,8,'2025-07-25','Present'),(37,8,'2025-07-26','Absent'),(38,8,'2025-07-27','Present'),(39,8,'2025-07-28','Present'),(40,8,'2025-07-29','Present'),(41,9,'2025-07-25','Present'),(42,9,'2025-07-26','Present'),(43,9,'2025-07-27','Present'),(44,9,'2025-07-28','Absent'),(45,9,'2025-07-29','Present'),(46,10,'2025-07-25','Present'),(47,10,'2025-07-26','Present'),(48,10,'2025-07-27','Absent'),(49,10,'2025-07-28','Present'),(50,10,'2025-07-29','Present');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_info`
--

DROP TABLE IF EXISTS `employee_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_info` (
  `employee_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(25) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `employment_history` varchar(100) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_info`
--

LOCK TABLES `employee_info` WRITE;
/*!40000 ALTER TABLE `employee_info` DISABLE KEYS */;
INSERT INTO `employee_info` VALUES (1,'Sibongile Nkosi','Software Engineer','Development',70000.00,'Joined in 2015, promoted to Senior in 2018','sibongile.nkosi@moderntech.com'),(2,'Lungile Moyo','HR Manager','HR',80000.00,'Joined in 2013,promoted to Manager in 2017','lungile.moyo@moderntech.com'),(3,'Thabo Molefe','Quality Analyst','QA',55000.00,'Joined in 2018','thabo.molefe@moderntech.com'),(4,'Keshav Nadioo','Sales Representative','Sales',60000.00,'Joined in 2020','keshav.naidoo@moderntech.com'),(5,'Zanele Khumalo','Marketing Specialist','Marketing',58000.00,'Joined in 2019','zanele.khumalo@moderntech.com'),(6,'Sipho Zulu','UI/Ux Designer','Design',65000.00,'Joined in 2016','sipho.zulu@moderntech.com'),(7,'Naledi Moeketsi','DevOps Engineer','IT',72000.00,'Joined in 2017','naledi.moeketsi@moderntech.com'),(8,'Farai Gumbo','Content Strategist','Marketing',56000.00,'Joined in 2021','farai.gumbo@moderntech.com'),(9,'Karabo Dlamini','Accountant','Finance',62000.00,'Joined in 2018','karabo.dlamini@moderntech.com'),(10,'Fatima Patel','Customer Support Lead','Support',58000.00,'Joined in 2016','fatima.patel@moderntech.com'), (11, 'John Doe','Software Engineer','Development',70000.00,'Joined in 2015, promoted to Senior in 2018','sibongile.nkosi@moderntech.com');
/*!40000 ALTER TABLE `employee_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `leave_id` int unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` int unsigned NOT NULL,
  `leave_date` date NOT NULL,
  `leave_type` varchar(50) NOT NULL,
  `status` enum('Approved','Pending','Denied') NOT NULL,
  PRIMARY KEY (`leave_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_info` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (1,1,'2025-07-22','Sick leave','Approved'),(2,1,'2024-12-01','Personl','Pending'),(3,2,'2025-07-15','Family Responsibility','Denied'),(4,2,'2024-12-02','Vacation','Approved'),(5,3,'2025-07-10','Medical Appointment','Approved'),(6,3,'2024-12-05','Personal','Pending'),(7,4,'2025-07-20','Bereavement','Approved'),(8,5,'2024-12-01','Childcare','Pending'),(9,6,'2025-07-18','Sick Leave','Approved'),(10,7,'2025-07-22','Vacation','Pending'),(11,8,'2024-12-02','Medical Appointment','Approved'),(12,9,'2025-07-19','Childcare','Denied'),(13,10,'2024-12-03','Vacation','Pending');
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` int unsigned NOT NULL,
  `hours_worked` int NOT NULL,
  `leave_deductions` int DEFAULT '0',
  `final_salary` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_info` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll`
--

LOCK TABLES `payroll` WRITE;
/*!40000 ALTER TABLE `payroll` DISABLE KEYS */;
INSERT INTO `payroll` VALUES (1,1,160,8,69500.00),(2,2,150,10,79000.00),(3,3,170,4,54800.00),(4,4,165,6,59700.00),(5,5,158,5,57850.00),(6,6,168,2,64800.00),(7,7,175,3,71800.00),(8,8,160,0,56000.00),(9,9,155,5,61500.00),(10,10,162,4,57750.00);
/*!40000 ALTER TABLE `payroll` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-03 15:09:23
