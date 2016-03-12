'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signin = signin;
exports.callback = callback;

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _index = require('../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function signin(event, config, callback) {
  var params = {
    client_id: config.id,
    redirect_uri: config.redirect_uri,
    response_type: 'code',
    scope: 'profile email'
  };
  var url = _index.utils.urlBuilder('https://accounts.google.com/o/oauth2/v2/auth', params);
  callback(null, { url: url });
}

function callback(event, config, callback) {
  _async2.default.waterfall([function (callback) {
    var payload = {
      client_id: config.id,
      redirect_uri: config.redirect_uri,
      client_secret: config.secret,
      code: event.code,
      grant_type: 'authorization_code'
    };
    _request2.default.post('https://www.googleapis.com/oauth2/v4/token', { form: payload }, callback);
  }, function (response, data, callback) {
    var d = JSON.parse(data);
    var url = _index.utils.urlBuilder('https://www.googleapis.com/plus/v1/people/me', {
      access_token: d.access_token
    });
    _request2.default.get(url, function (error, response, data) {
      if (!error) {
        callback(null, mapProfile(JSON.parse(data)));
      } else {
        callback(err);
      }
    });
  }], function (err, data) {
    callback(err, data);
  });
}

function mapProfile(response) {
  return new _index.Profile({
    id: response.id,
    name: response.displayName,
    email: response.emails[0].value,
    picture: response.image.url,
    provider: 'google'
  });
}