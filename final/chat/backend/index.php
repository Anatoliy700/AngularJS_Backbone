<?php
header('Content-Type: application/json;charset=utf-8');
header('Accept: application/json');
$postData = file_get_contents('php://input');
$data = json_decode($postData, true);

if ($data['method'] === 'login') {
  $res = [
    "jsonrpc" => "2.0",
    "result" => [
      "auth_sid" => "bb02c6365c097bdf75be3f6885d2af334e7ce4d7",
      "auth_token" => "e4a926e847bb8490313bc103555a26696a6eb06f"
    ],
    "id" => "1"
  ];
  echo json_encode($res);
} else {
  echo json_encode($data);
};


//var_dump($data);
//var_dump($_SERVER);