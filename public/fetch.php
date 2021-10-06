<?php

$date = date_create();
$data = file_get_contents("https://dl.labymod.net/addons.json");
$content = json_decode($data, true);
$content["time"] = date_timestamp_get($date);
file_put_contents("addons.json", json_encode($content));
?>