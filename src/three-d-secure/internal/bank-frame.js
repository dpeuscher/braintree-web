'use strict';

var Bus = require('../../lib/bus');
var isWhitelistedDomain = require('../../lib/is-whitelisted-domain');
var queryString = require('../../lib/querystring');
var BraintreeError = require('../../lib/braintree-error');
var sanitizeUrl = require('@braintree/sanitize-url').sanitizeUrl;
var errors = require('../shared/errors');

module.exports = function () {
  var bus = new Bus({
    channel: window.name.split('_')[1]
  });
  var params = queryString.parse();

  if (params.showLoader === 'true') {
    document.querySelector('#loader').className = '';
  }

  bus.emit(Bus.events.CONFIGURATION_REQUEST, handleConfiguration);
};

function handleConfiguration(configuration) {
  var input, field;
  var fields = {pareq: 'PaReq', md: 'MD', termUrl: 'TermUrl'};
  var form = document.createElement('form');

  if (!isWhitelistedDomain(configuration.termUrl)) {
    throw new BraintreeError(errors.THREEDS_TERM_URL_REQUIRES_BRAINTREE_DOMAIN);
  }

  form.action = sanitizeUrl(configuration.acsUrl);
  form.method = 'POST';

  for (field in fields) {
    if (fields.hasOwnProperty(field)) {
      input = document.createElement('input');
      input.name = fields[field];
      input.type = 'hidden';
      input.setAttribute('value', configuration[field]);
      form.appendChild(input);
    }
  }

  document.body.appendChild(form);

  form.submit();
}
