'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { TerminalCapture } = require('../dist/collectors/terminal');

describe('terminal', () => {
  it('captures stdout from a command', async () => {
    const term = new TerminalCapture('echo hello-terminal');
    const chunks = [];
    term.on('data', d => chunks.push(d));

    await new Promise((resolve) => {
      term.on('exit', resolve);
      term.start();
    });

    const stdout = chunks.filter(c => c.type === 'stdout').map(c => c.text).join('');
    assert.ok(stdout.includes('hello-terminal'), 'should capture stdout');
    assert.equal(term.exitCode, 0);
    assert.equal(term.running, false);
  });

  it('captures stderr from a command', async () => {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? 'echo stderr-test >&2' : 'echo stderr-test >&2';
    const term = new TerminalCapture(cmd);
    const chunks = [];
    term.on('data', d => chunks.push(d));

    await new Promise((resolve) => {
      term.on('exit', resolve);
      term.start();
    });

    const stderr = chunks.filter(c => c.type === 'stderr').map(c => c.text).join('');
    assert.ok(stderr.includes('stderr-test'), 'should capture stderr');
  });

  it('reports exit code for failed commands', async () => {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? 'exit /b 42' : 'exit 42';
    const term = new TerminalCapture(cmd);

    await new Promise((resolve) => {
      term.on('exit', resolve);
      term.start();
    });

    assert.equal(term.exitCode, 42);
    assert.equal(term.running, false);
  });

  it('buffers output and returns via getBuffer()', async () => {
    const term = new TerminalCapture('echo line1 && echo line2');

    await new Promise((resolve) => {
      term.on('exit', resolve);
      term.start();
    });

    const buf = term.getBuffer();
    // Buffer includes system line ($ command) + stdout + exit message
    assert.ok(buf.length >= 2, 'buffer should have entries');
    assert.ok(buf[0].type === 'system', 'first entry should be system (command echo)');
  });

  it('getStatus() returns correct state', async () => {
    const term = new TerminalCapture('echo status-test');
    term.start();

    const running = term.getStatus();
    assert.equal(running.command, 'echo status-test');
    // May or may not be running depending on timing
    assert.ok(typeof running.running === 'boolean');

    await new Promise((resolve) => {
      term.on('exit', resolve);
    });

    const done = term.getStatus();
    assert.equal(done.running, false);
    assert.equal(done.exitCode, 0);
  });

  it('respects maxLines buffer limit', async () => {
    const isWindows = process.platform === 'win32';
    // Generate many lines
    const cmd = isWindows
      ? 'for /L %i in (1,1,50) do @echo line%i'
      : 'for i in $(seq 1 50); do echo line$i; done';
    const term = new TerminalCapture(cmd, { maxLines: 10 });

    await new Promise((resolve) => {
      term.on('exit', resolve);
      term.start();
    });

    assert.ok(term.getBuffer().length <= 10, 'buffer should not exceed maxLines');
  });

  it('does not accept input when interactive is false', async () => {
    const term = new TerminalCapture('echo readonly');
    term.start();
    const result = term.write('test input');
    assert.equal(result, false, 'write should return false in read-only mode');

    await new Promise((resolve) => {
      term.on('exit', resolve);
    });
  });

  it('stop() terminates the process', async () => {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? 'ping -n 30 127.0.0.1' : 'sleep 30';
    const term = new TerminalCapture(cmd);

    const exitPromise = new Promise((resolve) => {
      term.on('exit', resolve);
    });

    term.start();
    assert.equal(term.running, true);

    // Give it a moment to start
    await new Promise(r => setTimeout(r, 200));
    term.stop();

    const { code, signal } = await exitPromise;
    assert.equal(term.running, false);
  });
});
