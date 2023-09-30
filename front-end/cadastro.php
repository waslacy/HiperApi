<?php
if (!isset($_SESSION)) {
    session_start();
}
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['adm'] != 1) {
    header('Location: dashboard.php');
}
require "db.php";

$status = false;

if (isset($_POST['user'])) {
    $user = $msqli->real_escape_string($_POST['user']);
    $senha = md5($msqli->real_escape_string($_POST['pswrd']));
    $client = $msqli->real_escape_string($_POST['cliente']);
    $url = $msqli->real_escape_string($_POST['url_site']);
    $c_key = $msqli->real_escape_string($_POST['c_key']);
    $c_secret = $msqli->real_escape_string($_POST['c_secret']);
    $c_hiper = $msqli->real_escape_string($_POST['c_hiper']);
    $values = "'" . $user . "', '" . $senha . "', '" . $client . "', 1, '" . $url . "', '" . $c_key . "', '" . $c_secret . "', '" . $c_hiper . "'";

    $sql_code = "INSERT INTO config_api (login, senha, cliente, ativo, url_site, c_key, c_secret, c_hiper) VALUE (" . $values . ")";
    $sql_query = $msqli->query($sql_code) or die("Algo deu errado: " . $msqli->error);

    $status = true;
}
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastrar</title>
    <link rel="stylesheet" href="css/add-edit/add-edit.css">
</head>

<body>
    <header>
        <div class="container">
            <a href="dashboard.php"><img src="src/logotipo branco.png" alt="Logotipo Tecleweb" width="150"></a>

            <div class="buttons">
                <a href="dashboard.php" class="btn">Dashboard</a>
                <a href="index.php?logoff=1" class="btn">Sair</a>
            </div>
        </div>
    </header>

    <section>
        <div class="container">
            <h1>Cadastrar Novo Usuário</h1>
            <?php if ($status == true) {
                echo '<h2 style="color: #0f0; margin-top: -20px;">Usuário criado com sucesso!</h2>';
            } ?>

            <form action="cadastro.php" method="POST">
                <div class="flex">
                    <div class="form-group">
                        <label for="user">Usuário</label>
                        <input type="text" placeholder="Usuário" name="user">
                    </div>

                    <div class="form-group">
                        <label for="user">Cliente</label>
                        <input type="text" placeholder="Usuário" name="cliente">
                    </div>

                    <div class="form-group">
                        <label for="pswrd">Senha</label>
                        <input type="password" placeholder="senha" name="pswrd">
                    </div>

                    <div class="form-group">
                        <label for="user">Url Site</label>
                        <input type="text" placeholder="Usuário" name="url_site">
                    </div>

                    <div class="form-group">
                        <label for="user">Consumer Key</label>
                        <input type="text" placeholder="Usuário" name="c_key">
                    </div>

                    <div class="form-group">
                        <label for="user">Consumer Secret</label>
                        <input type="text" placeholder="Usuário" name="c_secret">
                    </div>


                    <div class="form-group">
                        <label for="user">Chave Hiper</label>
                        <input type="text" placeholder="Usuário" name="c_hiper">
                    </div>
                </div>

                <?php if (isset($_GET['err'])) { ?>
                    <div class="erros">
                        <?php if ($_GET['err'] == 1 || $_GET['err'] == 2) {
                            echo '<p>Preencher todos os campos!</p>';
                        } ?>
                    </div> <?php } ?>

                <div class="form-group">
                    <input type="submit" value="Salvar">
                </div>
            </form>
        </div>
    </section>
</body>

</html>