'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { checkPorts, getProcessHealth, checkEnv, checkEnvFile, tailLog } = require('../dist/utils/system-info');

describe('system-info', () => {
  describe('checkPorts', () => {
    it('returns up and down arrays', async () => {
      const result = await checkPorts([1, 2, 3]); // unlikely to be in use
      assert.ok(Array.isArray(result.up));
      assert.ok(Array.isArray(result.down));
      assert.strictEqual(result.down.length, 3);
    });
  });

  describe('getProcessHealth', () => {
    it('returns structured health info', () => {
      const health = getProcessHealth();
      assert.ok(health.node);
      assert.ok(health.node.pid > 0);
      assert.ok(health.node.memory);
      assert.ok(health.node.memory.rss);
      assert.ok(health.system);
      assert.ok(health.system.platform);
      assert.ok(health.system.totalMemory);
      assert.ok(health.system.memoryUsage.includes('%'));
    });
  });

  describe('checkEnv', () => {
    it('checks specific env vars', () => {
      const result = checkEnv(['PATH', 'NONEXISTENT_VAR_12345']);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].key, 'PATH');
      assert.strictEqual(result[0].set, true);
      assert.strictEqual(result[1].key, 'NONEXISTENT_VAR_12345');
      assert.strictEqual(result[1].set, false);
      // Should NEVER expose values
      assert.ok(!('value' in result[0]));
    });

    it('uses defaults when no keys provided', () => {
      const result = checkEnv();
      assert.ok(result.length > 0);
      assert.ok(result.some(r => r.key === 'NODE_ENV'));
    });
  });

  describe('tailLog', () => {
    it('reads last N lines from a file', () => {
      const tmpFile = path.join(os.tmpdir(), `localpov-test-tail-${process.pid}.log`);
      const lines = Array.from({ length: 50 }, (_, i) => `line ${i + 1}`);
      fs.writeFileSync(tmpFile, lines.join('\n'));

      try {
        const result = tailLog(tmpFile, 10);
        assert.ok(!result.error);
        assert.strictEqual(result.lineCount, 10);
        assert.ok(result.lines[result.lines.length - 1].includes('line 50'));
      } finally {
        fs.unlinkSync(tmpFile);
      }
    });

    it('returns error for nonexistent file', () => {
      const result = tailLog('/nonexistent/file/path.log');
      assert.ok(result.error);
    });

    it('handles empty file', () => {
      const tmpFile = path.join(os.tmpdir(), `localpov-test-empty-${process.pid}.log`);
      fs.writeFileSync(tmpFile, '');

      try {
        const result = tailLog(tmpFile, 10);
        assert.ok(!result.error);
        assert.strictEqual(result.size, 0);
      } finally {
        fs.unlinkSync(tmpFile);
      }
    });
  });

  describe('checkEnvFile', () => {
    it('checks for .env files', () => {
      const result = checkEnvFile(os.tmpdir());
      assert.ok(Array.isArray(result));
      assert.ok(result.some(r => r.file === '.env'));
    });
  });
});
