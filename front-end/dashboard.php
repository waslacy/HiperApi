<?php
if (!isset($_SESSION)) {
    session_start();
}

if (!isset($_SESSION['usuario'])) {
    header('Location: index.php');
}

?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="css/dashboard/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" integrity="sha512-xh6O/CkQoPOWDdYTDqeRdPCVd1SpvCA9XXcUnZS2FmJNp1coAFzvtCN9BmamE+4aHK8yyUHUSCcJHgXloTyT2A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>

<body onload="">
    <header>
        <div class="container">
            <a href="dashboard.php"><img src="src/logotipo branco.png" alt="Logotipo Tecleweb" width="150"></a>

            <div class="buttons">
                <a href="duvidas.php" class="btn"><i class="fa-solid fa-question"></i></a>
                <a href="cadastro.php" class="btn">Cadastrar</a>
                <a href="index.php?logoff=1" class="btn">Sair</a>
            </div>
        </div>
    </header>

    <?php
    if (isset($_GET['filtro'])) {
        require 'clientes-filtro.php';
    } else {
        require 'clientes.php';
    }
    ?>

    <section>
        <div class="container">
            <div class="infos">
                <div class="info">
                    <i class="fa-solid fa-users"></i>
                    <h2>Produtos Hiper</h2>
                    <h4><?= '1' ?></h4>
                </div>

                <div class="info">
                    <i class="fa-solid fa-user"></i>
                    <h2>Último Ponto de Sincronização</h2>
                    <h4><?= '1' ?></h4>
                </div>

                <div class="info">
                    <i class="fa-solid fa-cart-plus"></i>
                    <h2>Última exportação de pedidos</h2>
                    <h4><?= '1' ?></h4>
                </div>
            </div>
        </div>
    </section>

    <script src="js/script.js"></script>
</body>

</html>