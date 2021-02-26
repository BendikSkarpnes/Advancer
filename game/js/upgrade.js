// request to transaction.php
let xmlhttp;

function executePurchase(url, userID, upgrade) {
    let params = "userID=" + userID +"&upgrade=" + upgrade;

    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = handleFile;
    xmlhttp.open("GET", url+"?"+params, true);
    xmlhttp.send();
}

function handleFile(){
    if (xmlhttp. readyState == 4 && xmlhttp.status == 200) {
        let response = xmlhttp.response;
        upgrades = JSON.parse(response);
        updatePrices(upgrades);
        
        console.log(upgrades)
    }
}



// button interaction
let button_armor   = document.getElementById("button_armor");
let button_speed   = document.getElementById("button_speed");
let button_laser   = document.getElementById("button_laser");
let button_missile = document.getElementById("button_missile");
let button_energy  = document.getElementById("button_energy");

button_armor.onclick   = function() {executePurchase("db/transaction.php", userID, "armor");}
button_speed.onclick   = function() {executePurchase("db/transaction.php", userID, "speed");}
button_laser.onclick   = function() {executePurchase("db/transaction.php", userID, "laser");}
button_missile.onclick = function() {executePurchase("db/transaction.php", userID, "missile");}
button_energy.onclick  = function() {executePurchase("db/transaction.php", userID, "energy");}

// visual effects
function price(level) {
    if (level<5) return (level*10).toString() + "§";
    else         return "maxed";      
}

function updatePrices(upgrades) {
    button_armor  .innerHTML = price(upgrades.armor  );
    button_speed  .innerHTML = price(upgrades.speed  );
    button_laser  .innerHTML = price(upgrades.laser  );
    button_missile.innerHTML = price(upgrades.missile);
    button_energy .innerHTML = price(upgrades.energy );
}