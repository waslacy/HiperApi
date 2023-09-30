<?php
if (!isset($_SESSION)) {
    session_start();
}

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['adm'] != 1) {
    header('Location: dashboard.php');
}

require "db.php";

$cliente = $_GET['id'];

$sql_code = 'UPDATE config_api SET ativo=0 WHERE id=' .$cliente;
$sql_query = $msqli->query($sql_code) or die("Algo deu errado: " .$msqli->error);

header('Location: dashboard.php');
?>