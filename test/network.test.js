const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { getLocalIP, getAllIPs } = require('../dist/utils/network');

describe('network', () => {
  it('getLocalIP returns a string', () => {
    const ip = getLocalIP();
    assert.strictEqual(typeof ip, 'string');
  });

  it('getLocalIP returns a valid IPv4 address', () => {
    const ip = getLocalIP();
    const ipv4Pattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    assert.match(ip, ipv4Pattern);
  });

  it('getAllIPs returns an array', () => {
    const ips = getAllIPs();
    assert.ok(Array.isArray(ips));
  });

  it('each IP has name and address properties', () => {
    const ips = getAllIPs();
    for (const entry of ips) {
      assert.ok(typeof entry.name === 'string', 'name should be a string');
      assert.ok(typeof entry.address === 'string', 'address should be a string');
    }
  });
});
