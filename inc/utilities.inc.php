<?php
/* post.class.php

Copyright (c) 2011- SUN Junwen

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
require_once "ez_sql_core.php"; // Include ezSQL core
require_once "ez_sql_mysql.php"; // Include ezSQL database specific component
 
define("DB_USER", "tetris5");
define("DB_PSWD", "tetris5");
define("DB_NAME", "tetris5");
define("DB_HOST", "localhost");

/**
 * 获得数据库连接
 * @return ezSQL_mysql 对象
 */
function get_ezMysql()
{
	// Initialise database object and establish a connection
	// at the same time - db_user / db_password / db_name / db_host
	if(!defined('DB_USER') || !defined('DB_PSWD') || !defined('DB_NAME') ||!defined('DB_HOST'))
		return null;
	$db = new ezSQL_mysql(DB_USER, DB_PSWD, DB_NAME, DB_HOST);
	
	$db->hide_errors();
	
	$ret = $db->query("set names 'utf8'");
	if((!is_numeric($ret) && !$ret))
	{
		return null;
	}
	
	return $db;
}

?>