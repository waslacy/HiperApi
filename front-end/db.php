<?php

$usuario = 'tecleweb18_add2';
$pass = 'Tecle@123';
$host = 'mysql.tecleweb.dev.br';
$db = 'tecleweb18';

$msqli = new mysqli($host, $usuario, $pass, $db);

if ($msqli->error) {
    die("falha ao conectar". $msqli->error);
}