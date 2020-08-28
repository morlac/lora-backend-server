/**
 *
 */
const Influx = require('influx');
const FieldType = Influx.FieldType;

var influxSettings = require('./influxSettings.json').ttnmapper;
var TTNMapper_influx;

/**
 *
 */
function connectInfluxTtnMapper() {
  console.log("connecting ttnmapper");

  if (!TTNMapper_influx) {
    console.log("creating fresh connection to TTNMapper");

    TTNMapper_influx = new Influx.InfluxDB({
      host: influxSettings.host,
      database: influxSettings.database,
      username: influxSettings.username,
      password: influxSettings.password,
      schema: [
        {
	  measurement: 'points',
	  fields: {
            altitude       : FieldType.FLOAT,
	    hdop           : FieldType.FLOAT,
	    lat            : FieldType.FLOAT,
	    lon            : FieldType.FLOAT,
            temperature    : FieldType.FLOAT, 
	    battery        : FieldType.FLOAT,
	    application    : FieldType.STRING,
	    counter        : FieldType.INTEGER,
	    port           : FieldType.INTEGER,
	    hardware_serial: FieldType.STRING,
            recv_frequency : FieldType.FLOAT,
	    recv_channel   : FieldType.INTEGER,
	    recv_rssi      : FieldType.FLOAT,
	    recv_snr       : FieldType.FLOAT
          },
	  tags: [
	    'name',
	    'geohash'            
	  ]
	}
      ]
    });    
  }

  return TTNMapper_influx;
}

module.exports = connectInfluxTtnMapper();

