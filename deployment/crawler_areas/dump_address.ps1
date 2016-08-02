$user='xxnr'
$password='txht001'
$db = 'xxnr'
mongodump --collection provinces --db $db -u $user -p $password
mongodump --collection cities --db $db -u $user -p $password
mongodump --collection counties --db $db -u $user -p $password
mongodump --collection towns --db $db -u $user -p $password
mongodump --collection specialprovinces --db $db -u $user -p $password