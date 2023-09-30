<?php

if (!isset($_SESSION)) {
    session_start();
}
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['adm'] != 1) {
    header('Location: dashboard.php');
}
$clienteId = $_GET['id'];

require "db.php";

$sql_code = 'SELECT * FROM config_api WHERE id=' . $clienteId;
$sql_query = $msqli->query($sql_code) or die("Algo deu errado: " . $msqli->error);

$cliente = $sql_query->fetch_assoc();

$status = false;

if (isset($_POST['user'])) {
    $user = $msqli->real_escape_string($_POST['user']);
    $senha = md5($msqli->real_escape_string($_POST['pswrd']));
    $client = $msqli->real_escape_string($_POST['cliente']);
    $url = $msqli->real_escape_string($_POST['url_site']);
    $c_key = $msqli->real_escape_string($_POST['c_key']);
    $c_secret = $msqli->real_escape_string($_POST['c_secret']);
    $c_hiper = $msqli->real_escape_string($_POST['c_hiper']);

    if ($_POST['pswrd'] == "") {
        $senha = $msqli->real_escape_string($cliente["senha"]);
    }

    $sql_code = "UPDATE config_api SET login='" . $user . "', senha='" . $senha . "', cliente='" . $client . "', url_site='" . $url . "', c_key='" . $c_key . "', c_secret='" . $c_secret . "', c_hiper='" . $c_hiper . "' WHERE id='" . $clienteId . "'";
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
    <title>Editar</title>
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
            <h1>Editar Usuário</h1>
            <?php if ($status == true) {
                echo '<h2 style="color: #0f0; margin-top: -20px;">Usuário atualizado com sucesso!</h2>';
            } ?>

            <form action="<?php "editar.php?id=" . $_GET['id'] ?>" method="POST">
                <div class="flex">
                    <div class="form-group">
                        <label for="user">Usuário</label>
                        <input type="text" placeholder="Usuário" name="user" value="<?= $cliente["login"] ?>">
                    </div>

                    <div class="form-group">
                        <label for="user">Cliente</label>
                        <input type="text" placeholder="Usuário" name="cliente" value="<?= $cliente["cliente"] ?>">
                    </div>

                    <div class="form-group">
                        <label for="pswrd">Senha</label>
                        <input type="password" placeholder="senha" name="pswrd">
                    </div>

                    <div class="form-group">
                        <label for="user">Url Site</label>
                        <input type="text" placeholder="Usuário" name="url_site" value="<?= $cliente["url_site"] ?>">
                    </div>

                    <div class="form-group">
                        <label for="user">Consumer Key</label>
                        <input type="text" placeholder="Usuário" name="c_key" value="<?= $cliente["c_key"] ?>">
                    </div>

                    <div class="form-group">
                        <label for="user">Consumer Secret</label>
                        <input type="text" placeholder="Usuário" name="c_secret" value="<?= $cliente["c_secret"] ?>">
                    </div>


                    <div class="form-group">
                        <label for="user">Chave Hiper</label>
                        <input type="text" placeholder="Usuário" name="c_hiper" value="<?= $cliente["c_hiper"] ?>">
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