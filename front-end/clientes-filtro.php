<?php
if (!isset($_SESSION)) {
    session_start();
}

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['adm'] != 1) {
    header('Location: dashboard.php');
}

require "db.php";

$ativo = $_POST['ativo'];

$sql_code = "SELECT * FROM config_api WHERE ativo=" . $ativo;

if ($_POST['cliente'] != "") {
    $cliente = $msqli->real_escape_string($_POST['cliente']);
    $sql_code = "SELECT * FROM config_api WHERE ativo=" . $ativo . " AND cliente='" . $cliente . "'";
} else if ($ativo == '2') {
    $sql_code = "SELECT * FROM config_api";
}

$sql_query = $msqli->query($sql_code) or die("Algo deu errado: " . $msqli->error);

$clientes = $sql_query->fetch_all();

?>

<section id="filtro">
    <div class="container">
        <form action="dashboard.php?filtro=1" method="POST">
            <h2>Filtrar clientes |</h2>

            <div class="form-group">
                <label for="cliente">Cliente:</label>
                <input type="text" placeholder="cliente" name="cliente">
            </div>

            <select name="ativo">
                <option value="2" selected>Status</option>
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
            </select>

            <input type="submit" value="Filtrar">
        </form>
    </div>
</section>

<section id="tabela-clientes">
    <div class="container">
        <div class="filtro"></div>

        <div class="clientes">
            <table>
                <thead class="clientes-title">
                    <tr>
                        <th>Cliente</th>
                        <th>Ativo</th>
                        <th>Ponto de Sincronização</th>
                        <th>Data de Sincronização</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody class="clientes-body">
                    <?php foreach ($clientes as $c) { 
                        $data = $c[11];
                        $data = str_replace('%20', ' ', $data);    
                    ?>
                        <tr class="cliente">
                            <td><?= $c[4] ?></td>
                            <td><?= $c[5] ?></td>
                            <td><?= $c[10] ?></td>
                            <td><?= $data ?></td>
                            <td class="actions">
                                <a href="<?php echo "edit.php?id=" . $c[0] ?>"><i class="fa-sharp fa-solid fa-pencil"></i></a>
                                <a href="<?php echo "remove.php?id=" . $c[0] ?>"><i class="fa-solid fa-trash"></i></a>
                            </td>
                        </tr>
                    <?php } ?>
                </tbody>
            </table>
        </div>
    </div>
</section>