-- phpMyAdmin SQL Dump
-- version 3.3.8
-- http://www.phpmyadmin.net
--
-- 主机: localhost
-- 生成日期: 2011 年 06 月 23 日 06:54
-- 服务器版本: 5.0.67
-- PHP 版本: 5.3.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- 数据库: `tetris5`
--

-- --------------------------------------------------------

--
-- 表的结构 `results`
--

CREATE TABLE IF NOT EXISTS `results` (
  `id` varchar(32) NOT NULL,
  `name` varchar(255) NOT NULL,
  `ip` varchar(32) NOT NULL,
  `score` int(11) NOT NULL,
  `level` int(11) NOT NULL,
  `play_time` int(11) NOT NULL,
  `time` timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  PRIMARY KEY  (`id`,`time`),
  KEY `name` (`name`),
  KEY `score` (`score`),
  KEY `level` (`level`),
  KEY `play_time` (`play_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
