<?php
    require("connection.php");

    $userID = $_GET["userID"];
    $data = json_decode( $_GET["data"] ); // url escape


    // 
    $polygonSTR = "[";

    foreach ($data -> polygon as $point) {
        $polygonSTR .= "[";
        foreach ($point as $value) {
            $polygonSTR .= $value . ",";
        }
        $polygonSTR = substr($polygonSTR, 0, -1);
        $polygonSTR .= "],";
    }

    if (count($data -> polygon)) {
        $polygonSTR = substr($polygonSTR, 0, -1);
    }

    $polygonSTR .= "]";



    // fjern gamle verdier fra DB
    $sql = "DELETE FROM ships WHERE userid=$userID;";
    $result = mysqli_query($connection, $sql);  

    $sql = "DELETE FROM lasers WHERE userid=$userID;";
    $result = mysqli_query($connection, $sql); 



    // legg til oppdaterte verdier i DB
    $sql = "INSERT INTO ships (userid, boundingvolume) VALUES($userID, \"$polygonSTR\");";
    echo $sql;
    $result = mysqli_query($connection, $sql);

    // for hver laser
    // foreach($data->lasers as $lasers) {
    //     $sql = "INSERT INTO lasers VALUES($userID, \"$lasers->location\");";
    //     $result = mysqli_query($connection, $sql);  
    // }



    // hente ut objekter fra andre spillere fra DB
    // skip
    $ships = [1,2,3]; 
    $sql = "SELECT * FROM ships WHERE NOT userid=$userID;";
    $result = mysqli_query($connection, $sql); 
    while ($row = mysqli_fetch_assoc($result)) {
        array_push($ships, $row["boundingvolume"]);
    }
    
    // lasere
    $lasers = [];
    $sql = "SELECT * FROM lasers WHERE NOT userid=$userID;";
    $result = mysqli_query($connection, $sql);
    while ($row = mysqli_fetch_assoc($result)) {
        array_push($lasers, $row["location"]);
    }



    // formatering
    $shipsJSON  = "["; 
    $lasersJSON = "[";

    foreach ($ships as $value) {
        $shipsJSON .= $value . ",";
    }

    foreach ($lasers as $value) {
        $lasersJSON .= $value . ",";
    }

    // fjern siste komma
    if (count($ships)) {
        $shipsJSON = substr($shipsJSON, 0, -1);
    }
    if (count($lasers)) {
        $lasersJSON = substr($lasersJSON, 0, -1);
    }

    // lukk parantesen
    $shipsJSON  .= "]"; 
    $lasersJSON .= "]";
?>

{
    "ships":  <?php echo $shipsJSON; ?>,
    "lasers": <?php echo $lasersJSON; ?>
}
