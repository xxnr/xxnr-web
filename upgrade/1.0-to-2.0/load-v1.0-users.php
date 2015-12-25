<?php
$users = array();
$conn = mysql_connect('101.200.181.247:3306', 'root', 'FcamOPRNyVw9');
mysql_select_db ( "stormy_bizcdb" );

$sql = "SELECT * FROM t_sys_user";
$result = mysql_query($sql,$conn);
$i = 0;

while ($row = mysql_fetch_array($result, MYSQL_NUM)) {
	$users[$i++] = $row;
}

mysql_free_result($result);

echo json_encode($users);

mysql_close($conn);
?>