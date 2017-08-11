<?php
require_once "inc/common.inc.php";
require_once "inc/ajax.class.php";

$ajax = new Ajax(get_query("oper"));

$ajax->do_oper();

?>