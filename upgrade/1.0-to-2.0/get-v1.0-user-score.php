<?php

$conn = mysql_connect('101.200.181.247:3306', 'root', 'FcamOPRNyVw9');
mysql_select_db ( "stormy_bizcdb" );
$usersScores = array();

$sql = "SELECT user_id, total_point_num FROM t_biz_point";
$result = mysql_query($sql,$conn);
$i = 0;

while ($row = mysql_fetch_array($result, MYSQL_NUM)) {
	$usersScores[$row[0]] = $row[1];
}

mysql_free_result($result);

mysql_close($conn);

echo json_encode($usersScores);
?>