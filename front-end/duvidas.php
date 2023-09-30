<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dúvidas</title>
    <link rel="stylesheet" href="css/dashboard/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" integrity="sha512-xh6O/CkQoPOWDdYTDqeRdPCVd1SpvCA9XXcUnZS2FmJNp1coAFzvtCN9BmamE+4aHK8yyUHUSCcJHgXloTyT2A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>

<body>
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

    <section id="duvidas">
        <div class="container">
            <h1>INTEGRAÇÃO LOJA VIRTUAL WOOCOMMERCE NO SISTEMA HIPER</h1>

            <div class="duvidas">
                <p>O ponto de sincronização está setado para 120 segundos (atualiza a cada 2 minutos). Não significa que o processo de salvar no banco de dados ocorra neste período, pois dependerá da quantidade de dados que irá atualizar.</p>

                <p>No painel de Integração, precisa informar o domínio incluindo o https://</p>

                <p>Peso deverá ser colocado no woocommerce manualmente.</p>

                <p>O produto não pode ser cadastrado no sistema do woocommerce manualmente, irá dar crash. Sempre cadastrar pelo sistema Hiper.</p>

                <p>Todo produto cadastrado no woocommerce na ABA Atributos, tem o IdKey com uma chave que não deve ser alterada para não perder a identificação no sistema Hiper.</p>

                <p>As categorias devem ser cadastradas exatamente com os mesmos nomes, tanto no Hiper, quanto no Woocommerce.</p>

                <p>Produtos com grades, no Hiper, não aparece na pagina de edição do produto do Woocommerce, porem internamente está correto, sendo assim ira apresentar de forma correta no frontend.</p>
            </div>
        </div>
    </section>
</body>

</html>