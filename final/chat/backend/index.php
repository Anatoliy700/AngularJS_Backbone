<?php
header('Content-Type: application/json;charset=utf-8');
header('Accept: application/json');
$postData = file_get_contents('php://input');
$data = json_decode($postData, true);

if ($data['method'] === 'login' || $data['method'] === 'register') {
  $res = [
    "jsonrpc" => "2.0",
    "result" => [
      "auth_sid" => "bb02c6365c097bdf75be3f6885d2af334e7ce4d7",
      "auth_token" => "e4a926e847bb8490313bc103555a26696a6eb06f"
    ],
    "id" => "1"
  ];
  echo json_encode($res);
} elseif ($data['method'] === 'get_msg') {
  
  $res = [
    "jsonrpc" => "2.0",
    "result" => [
      "total" => 100,
      "cout" => 10,
      "messages" => [
        [
          "from" => "mike",
          "to" => "all",
          "date" => "2018-08-01 23:59:59",
          "unixtime" => "1533153595",
          "body" => "Привет 1!"
        ],
        [
          "from" => "mike2",
          "to" => "all",
          "date" => "2018-08-01 23:59:59",
          "unixtime" => "1533153596",
          "body" => "Привет 2!"
        ],
        [
          "from" => "mike3",
          "to" => "all",
          "date" => "2018-08-01 23:59:59",
          "unixtime" => "1533153597",
          "body" => "Привет 3!"
        ],
        [
          "from" => "mike4",
          "to" => "all",
          "date" => "2018-08-01 23:59:59",
          "unixtime" => "1533153598",
          "body" => "Привет 4!"
        ],
        [
          "from" => "mike5",
          "to" => "all",
          "date" => "2018-08-01 23:59:59",
          "unixtime" => "1533153599",
          "body" => "Привет 5!"
        ]
      ]
    ],
    "id" => "1"
  ];
  echo json_encode($res);
} elseif ($data['method'] === 'send_msg') {
  
  $res = [
    "jsonrpc" => "2.0",
    "result" => [
      "success" => 1
    ],
    "id" => "1"
  ];
  
/*  $res = [
    "jsonrpc" => "2.0",
    "error" => [
      "code" => "1003",
      "message" => "sid and/or token incorrect"
    ],
    "id" => "1"
  ];*/

  echo json_encode($res);
} else {
  echo json_encode($data);
};

//var_dump($data);
//var_dump($_SERVER);