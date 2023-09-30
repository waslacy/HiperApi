<?php 

require "db.php";

if (isset($_POST['user']) || isset($_POST['pswrd'])) {
    if (strlen($_POST['user']) == 0){
        header('Location: index.php?err=1');
    } else if (strlen($_POST['pswrd']) == 0) {
        header('Location: index.php?err=2');
    } else {
        $user = $msqli->real_escape_string($_POST['user']);
        $senha = md5($msqli->real_escape_string($_POST['pswrd']));

        $sql_code = "SELECT * FROM config_api WHERE login = '$user' AND senha = '$senha'";
        $sql_query = $msqli->query($sql_code) or die("Algo deu errado: " .$msqli->error);

        if ($sql_query->num_rows == 1){
            $usuario = $sql_query->fetch_assoc();

            if($usuario["adm"] == 0){
                header('Location: index.php?err=3');
                die();
            }

            if(!isset($_SESSION)){
                session_start();
            }
            
            $_SESSION['usuario'] = $usuario;
            header('Location: dashboard.php');
        } else {
            header('Location: index.php?err=3');
        }
    }
}