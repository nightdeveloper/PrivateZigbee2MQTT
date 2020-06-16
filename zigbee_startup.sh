test -w /dev/ttyACM0 && echo success || echo failure

export PATH=/storage/node-v10/bin:$PATH

cd /storage/private-mqtt
echo 1
npm start > ../_private_mqtt.log & 
echo $! > ../_private_mqtt.pid

cd /storage/zigbee2mqtt
echo 2
npm start > ../_zigbee2mqtt.log &
echo $! > ../_zigbee2mqtt.pid
