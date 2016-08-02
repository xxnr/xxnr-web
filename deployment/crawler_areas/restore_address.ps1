$user='xxnr'
$password='txht001'
$db = 'xxnr2'

$currentDir = Split-Path -parent $MyInvocation.MyCommand.Definition
$provincePath = $currentDir + "\dump\xxnr\provinces.bson"
$cityPath = $currentDir + "\dump\xxnr\cities.bson"
$countyPath = $currentDir + "\dump\xxnr\counties.bson"
$townPath = $currentDir + "\dump\xxnr\towns.bson"
$specialProvincesPath = $currentDir + "\dump\xxnr\specialprovinces.bson"

#mongorestore --drop --collection provinces --db $db $provincePath -u $user -p $password
#mongorestore --drop --collection cities --db $db $cityPath -u $user -p $password
#mongorestore --drop --collection counties --db $db $countyPath -u $user -p $password
#mongorestore --drop --collection towns --db $db $townPath -u $user -p $password
#mongorestore --drop --collection specialprovinces --db $db $specialProvincesPath -u $user -p $password

mongorestore --drop --collection provinces --db $db $provincePath
mongorestore --drop --collection cities --db $db $cityPath
mongorestore --drop --collection counties --db $db $countyPath
mongorestore --drop --collection towns --db $db $townPath
mongorestore --drop --collection specialprovinces --db $db $specialProvincesPath