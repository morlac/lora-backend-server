/**
 *
 */
var express = require('express');
var router = express.Router();
var util = require('util');
var geohash = require('ngeohash');

var influxTtnMapper = require('../influxTtnMapper');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('ttnmapper', { title: 'TTN-Mapper' });
});

/* receive data and send to influx-db */
router.post('/data/transmit', function(req, res, next) {
  console.log(util.inspect(req.body, {depth: null}));

  //console.log(util.inspect(req.headers, {depth: null}));

  var body = req.body;

  var device_id = body.dev_id;
  var application_id = body.app_id;
  var counter = body.counter;
  var hardware_serial = body.hardware_serial;
  var port = body.port;

  var lora_fields = body.payload_fields;
  
  console.log('processing lora_fields ..');

  var metadata = body.metadata;
  var recv_frequency = metadata.frequency;

  var gateway = metadata.gateways[0];
  var gateway_id   = gateway.gtw_id;
  var recv_channel = gateway.channel;
  var recv_rssi    = gateway.rssi;
  var recv_snr     = gateway.snr;

  var hash = geohash.encode(lora_fields.latitude, lora_fields.longitude);

  var influx_fields = {
	  'altitude'       : lora_fields.altitude,
	  'hdop'           : lora_fields.hdop,
	  'lat'            : lora_fields.latitude,
	  'lon'            : lora_fields.longitude,
	  'temperature'    : lora_fields.temperature,
	  'battery'        : lora_fields.battery,
	  'application'    : application_id,
	  'counter'        : counter,
	  'port'           : port,
	  'hardware_serial': hardware_serial,
	  'recv_frequency' : recv_frequency,
	  'recv_channel'   : recv_channel,
	  'recv_rssi'      : recv_rssi,
	  'recv_snr'       : recv_snr
	  };

  var influx_tags = {
	  'name': device_id,
	  'geohash': hash
	  };

  console.log('influx_fields: ' + util.inspect(influx_fields, {depth: null}));
  console.log('influx_tags  : ' + util.inspect(influx_tags, {depth: null}));

  var submit = influxTtnMapper.writePoints([{
		measurement: 'points',
		fields: influx_fields,
		tags: influx_tags
		}]);

  console.log("submit: [" + submit + "]");

  res.status('200').end();
});

module.exports = router;

