<?php 
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://ms-ecommerce.hiper.com.br/api/v1/auth/gerar-token/' . $_SESSION['usuario']['c_hiper']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
$result = curl_exec($ch);
curl_close($ch);
$token = json_decode($result)->token;
$header = ['Authorization: Bearer ' . $token];
$ch2 = curl_init();
curl_setopt($ch2, CURLOPT_URL, 'http://ms-ecommerce.hiper.com.br/api/v1/produtos/pontoDeSincronizacao');
curl_setopt($ch2, CURLOPT_HTTPHEADER, $header);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, TRUE);
$result2 = curl_exec($ch2);
curl_close($ch2);
$produtos = sizeof(json_decode($result2)->produtos);

$data = str_replace('%20', ' ', $_SESSION['usuario']['data_sinc']);
$data = str_replace('-', '/', $data);
$ano = substr($data, 0, 4);
$mes = substr($data, 5, 3);
$dia = substr($data, 8, 2);
$hora = substr($data, 11, 3);
$min = substr($data, 14, 2);

$data = $dia . '/' . $mes . $ano . ' ' . $hora . $min;

$ponto = $_SESSION['usuario']['ponto_sinc'];