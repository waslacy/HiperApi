<?php

if (isset($_GET['logoff']) && $_GET['logoff'] == 1) {
    session_start();
    session_destroy();
}


?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Woo - Hiper</title>
    <link rel="stylesheet" href="css/login/login.css">
</head>

<body>
    <div class="container">
        <a href="dashboard.php"><img src="src/logotipo branco.png" alt="Logotipo Tecleweb" width="150"></a>
        <h1>Login</h1>

        <form action="Auth.php" method="POST">
            <div class="form-group">
                <label for="user">Usuário</label>
                <input type="text" placeholder="Usuário" name="user">
            </div>

            <div class="form-group">
                <label for="pswrd">Senha</label>
                <input type="password" placeholder="senha" name="pswrd">
            </div>

            <?php if (isset($_GET['err'])) { ?>
                <div class="erros">
                    <?php if ($_GET['err'] == 1 || $_GET['err'] == 2) {
                        echo '<p>Preencher todos os campos!</p>';
                    } else if ($_GET['err'] == 3) {
                        echo '<p>Usuário ou senha incorretos!</p>';
                    } ?>
                </div> <?php } ?>

            <div class="form-group">
                <input type="submit">
            </div>
        </form>
    </div>
</body>

</html>