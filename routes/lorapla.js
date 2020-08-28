/**
 *
 */

var express = require('express');
var router = express.Router();
var util = require('util');

var influxPlants = require('../influxPlants');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('plants', { title: 'Plants' });
});

router.post('/data/transmit', function(req, res, next) {
  console.log(util.inspect(req.body, {depth: null}));

  var body = req.body;

  var device_id = body.dev_id;
  var application_id = body.app_id;
  var counter = body.counter;
  var hardware_serial = body.hardware_serial;
  var port = body.port;

  var channel = 0;

  var lora_fields = body.payload_fields.fields;
  
  var metadata = body.metadata;

  var recv_frequency = metadata.frequency;

  var gateway = metadata.gateways[0];
  var gateway_id   = gateway.gtw_id;
  var recv_channel = gateway.channel;
  var recv_rssi    = gateway.rssi;
  var recv_snr     = gateway.snr;

  console.log('processing lora_fields:');
  console.log(util.inspect(lora_fields, {depth: null}));

  var protocol_version = lora_fields[channel++].value;

  if (protocol_version == 1) {
    var battery          = lora_fields[channel++].value;
    var temperature      = lora_fields[channel++].value;
    var humidity         = lora_fields[channel++].value;

    var moisture_min     = lora_fields[channel++].value + (lora_fields[channel++].value << 8);
    var moisture_max     = lora_fields[channel++].value + (lora_fields[channel++].value << 8);
    var moisture_current = lora_fields[channel++].value + (lora_fields[channel++].value << 8);
    var moisture_percent = lora_fields[channel++].value;
  
    var influx_fields = {
	    'temperature'     : temperature,
	    'humidity'        : humidity,
	    'moisture_min'    : moisture_min,
	    'moisture_max'    : moisture_max,
	    'moisture_current': moisture_current,
	    'moisture_percent': moisture_percent,
	    'battery'         : battery,
	    'application'     : application_id,
            'counter'         : counter,
	    'port'            : port,
	    'hardware_serial' : hardware_serial,
	    'recv_frequency'  : recv_frequency,
	    'recv_channel'    : recv_channel,
	    'recv_rssi'       : recv_rssi,
	    'recv_snr'        : recv_snr
	    };

    console.log('influx_fields: ' + util.inspect(influx_fields, {depth: null}));

    var influx_tags = {
	    'device_id': device_id,
	    'gateway_id': gateway_id,
	    };
    
    console.log('influx_tags  : ' + util.inspect(influx_tags, {depth: null}));

    var submit = influxPlants.writePoints([{
	    measurement: 'plants',
	    fields: influx_fields,
	    tags: influx_tags
	    }]);

    console.log("submit: [" + submit + "]");
  } else if (protocol_version == 2) {
    var battery            = lora_fields[channel++].value;
    var temperature        = lora_fields[channel++].value;
    var humidity           = lora_fields[channel++].value;
    var barometricPressure = lora_fields[channel++].value;

    var sensor_data_current = [lora_fields[channel++].value, lora_fields[channel++].value, lora_fields[channel++].value, lora_fields[channel++].value];
    var sensor_data_percent = [lora_fields[channel++].value, lora_fields[channel++].value, lora_fields[channel++].value, lora_fields[channel++].value];

// currently we won't get these - the lpp-package would just be too big
//    var sensor_data_min = [lora_fields[channel++].value, lora_fields[channel++].value, lora_fields[channel++].value, lora_fields[channel++].value];
//    var sensor_data_max = [lora_fields[channel++].value, lora_fields[channel++].value, lora_fields[channel++].value, lora_fields[channel++].value];

    var write_points = [];

    for (var i = 0; i < 4; i++) {
      var influx_tags = {
            'device_id': device_id + '.' + i,
            'gateway_id': gateway_id,
            };

      var influx_fields = {
	      'temperature'        : temperature,
	      'humidity'           : humidity,
	      'barometric_pressure': barometricPressure,
	      'moisture_current'   : sensor_data_current[i] * 1000,
              'moisture_percent'   : sensor_data_percent[i],
//              'moisture_min'       : 0,
//              'moisture_max'       : 0,
	      'battery'            : battery,
	      'application'        : application_id,
	      'counter'            : counter,
	      'port'               : port,
	      'hardware_serial'    : hardware_serial,
	      'recv_frequency'     : recv_frequency,
	      'recv_channel'       : recv_channel,
	      'recv_rssi'          : recv_rssi,
	      'recv_snr'           : recv_snr
	      };

//      console.log('influx_fields: ' + util.inspect(influx_fields, {depth: null}));

      write_points.push({
	      measurement: 'plants',
	      fields: influx_fields,
	      tags: influx_tags
	      });
    }

    console.log('write_points: ' + util.inspect(write_points, {depth: null}));

    var submit = influxPlants.writePoints(write_points);

    console.log("submit: [" + submit + "]");
  }

  res.status('200').end();
});

module.exports = router;

