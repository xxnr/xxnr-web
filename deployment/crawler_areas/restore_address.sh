user=`xxnr`
password=`txht001`
db = `xxnr`

mongorestore --collection provinces --db $db "dump\xxnr\provinces.bson" -u $user -p $password
mongorestore --collection cities --db $db "dump\xxnr\cities.bson" -u $user -p $password
mongorestore --collection counties --db $db "dump\xxnr\counties.bson" -u $user -p $password
mongorestore --collection towns --db $db "dump\xxnr\towns.bson" -u $user -p $password