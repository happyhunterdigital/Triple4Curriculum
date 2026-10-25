/*
 * First-party consent gate. Loaded before any optional vendor script.
 * Scripts declared with type="text/plain" data-consent="analytics" are only
 * injected after the visitor clicks Accept.
 */
(function () {
  'use strict';

  var KEY = 'hh-cookie-consent';
  var EVENT = 'hh:consent-change';

  function normalise(value) {
    if (!value) return null;
    if (value === 'accepted' || value === 'declined') return value;
    if (value === 'true' || value === 'all') return 'accepted';
    if (value === 'false' || value === 'essential') return 'declined';
    try {
      var parsed = JSON.parse(value);
      var inner = parsed && (parsed.value || parsed.choice);
      if (inner === 'accepted' || inner === 'all' || inner === 'true') return 'accepted';
      if (inner === 'declined' || inner === 'essential' || inner === 'false') return 'declined';
    } catch (err) {
      /* not JSON */
    }
    return null;
  }

  function read() {
    try {
      var current = normalise(window.localStorage.getItem(KEY));
      if (current) return current;
      var legacy = ['hh_compliance_active', 't4c-cookie-consent', 'mmhfsp_cookie_consent', 'ludo-cookie-consent'];
      for (var i = 0; i < legacy.length; i++) {
        var migrated = normalise(window.localStorage.getItem(legacy[i]));
        if (migrated) return migrated;
      }
    } catch (err) {
      return null;
    }
    return null;
  }

  function activate() {
    if (read() !== 'accepted') return;
    var nodes = document.querySelectorAll('script[data-consent][type="text/plain"]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.getAttribute('data-consent-loaded') === 'true') continue;
      var replacement = document.createElement('script');
      for (var j = 0; j < node.attributes.length; j++) {
        var attr = node.attributes[j];
        if (attr.name === 'type' || attr.name === 'data-consent' || attr.name === 'data-src' || attr.name === 'data-consent-loaded') continue;
        replacement.setAttribute(attr.name, attr.value);
      }
      var src = node.getAttribute('data-src');
      if (src) replacement.src = src;
      else replacement.text = node.textContent || '';
      replacement.setAttribute('data-consent-loaded', 'true');
      node.parentNode.replaceChild(replacement, node);
    }
  }

  function set(value) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ value: value, ts: Date.now() }));
    } catch (err) {
      /* storage blocked: choice applies to this page view */
    }
    var event = new CustomEvent(EVENT, { detail: value });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
    if (value === 'accepted') activate();
  }

  window.HHConsent = {
    key: KEY,
    get: read,
    hasConsent: function () { return read() === 'accepted'; },
    set: set,
    accept: function () { set('accepted'); },
    decline: function () { set('declined'); },
    open: function () { document.dispatchEvent(new Event('hh:open-consent')); },
    activate: activate
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activate);
  } else {
    activate();
  }
})();
