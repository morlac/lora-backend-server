/**
 *
 */
const Influx = require('influx');
const FieldType = Influx.FieldType;

var influxSettings = require('./influxSettings.json').plantguard;

var Plants_influx;

/**
 *
 */
function connectInfluxPlants() {
  console.log("connecting Plants");

  if (!Plants_influx) {
    console.log("creating fresh connection to Plants");

    Plants_influx = new Influx.InfluxDB({
      host: influxSettings.host,
      database: influxSettings.database,
      username: influxSettings.username,
      password: influxSettings.password,
      schema: [
        {
	  measurement: 'plants',
	  fields: {
            temperature        : FieldType.FLOAT, 		// channel 1
            humidity           : FieldType.FLOAT,		// channel 2
	    barometric_pressure: FieldType.FLOAT,
	    moisture_min       : FieldType.INTEGER,	// channel 3
	    moisture_max       : FieldType.INTEGER,	// channel 4
	    moisture_current   : FieldType.INTEGER,	// channel 5
	    moisture_percent   : FieldType.FLOAT,		// channel 6
	    application        : FieldType.STRING,
	    counter            : FieldType.INTEGER,
	    hardware_serial    : FieldType.STRING,
	    port               : FieldType.INTEGER,
	    battery            : FieldType.FLOAT,		// channel 7
            recv_frequency     : FieldType.FLOAT,
	    recv_channel       : FieldType.INTEGER,
	    recv_rssi          : FieldType.FLOAT,
	    recv_snr           : FieldType.FLOAT
          },
	  tags: [
            'device_id',
	    'gateway_id'            
	  ]
	}
      ]
    });    
  }

  return Plants_influx;
}

module.exports = connectInfluxPlants();

