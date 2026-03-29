'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getInitScript, detectShell, setup, unsetup } = require('../dist/utils/shell-init');

describe('shell-init', () => {
  describe('getInitScript', () => {
    it('returns bash init script', () => {
      const script = getInitScript('bash');
      assert.ok(script);
      assert.ok(script.includes('LOCALPOV_SESSION'));
      assert.ok(script.includes('__localpov_init'));
      assert.ok(script.includes('script -q'));
      assert.ok(script.includes('cmd-start'));
      assert.ok(script.includes('cmd-end'));
      assert.ok(script.includes('PROMPT_COMMAND'));
    });

    it('returns zsh init script', () => {
      const script = getInitScript('zsh');
      assert.ok(script);
      assert.ok(script.includes('LOCALPOV_SESSION'));
      assert.ok(script.includes('add-zsh-hook'));
      assert.ok(script.includes('preexec'));
      assert.ok(script.includes('precmd'));
    });

    it('returns fish init script', () => {
      const script = getInitScript('fish');
      assert.ok(script);
      assert.ok(script.includes('LOCALPOV_SESSION'));
      assert.ok(script.includes('fish_preexec'));
      assert.ok(script.includes('fish_postexec'));
    });

    it('returns powershell init script', () => {
      const script = getInitScript('powershell');
      assert.ok(script);
      assert.ok(script.includes('LOCALPOV_SESSION'));
      assert.ok(script.includes('Start-Transcript'));
      assert.ok(script.includes('Stop-Transcript'));
    });

    it('returns null for unknown shell', () => {
      assert.strictEqual(getInitScript('tcsh'), null);
      assert.strictEqual(getInitScript(''), null);
    });

    it('bash script has recursion guard', () => {
      const script = getInitScript('bash');
      // First block: if LOCALPOV_SESSION not set, call __localpov_init
      // Second block: if set, install hooks
      assert.ok(script.includes('[ -n "$LOCALPOV_SESSION" ] && return 0'));
    });

    it('all scripts write session metadata', () => {
      for (const shell of ['bash', 'zsh', 'fish', 'powershell']) {
        const script = getInitScript(shell);
        assert.ok(script.includes('.meta'), `${shell} should write .meta file`);
      }
    });

    it('bash script has tee fallback when script command is unavailable', () => {
      const script = getInitScript('bash');
      assert.ok(script.includes('LOCALPOV_CAPTURE_MODE=tee'), 'should set capture mode env var');
      assert.ok(script.includes('tee -a'), 'should use tee for output capture');
      assert.ok(script.includes('exec >'), 'should redirect stdout through tee');
    });

    it('zsh script has tee fallback when script command is unavailable', () => {
      const script = getInitScript('zsh');
      assert.ok(script.includes('LOCALPOV_CAPTURE_MODE=tee'), 'should set capture mode env var');
      assert.ok(script.includes('tee -a'), 'should use tee for output capture');
    });

    it('fish script has fallback when script command is unavailable', () => {
      const script = getInitScript('fish');
      assert.ok(script.includes('LOCALPOV_CAPTURE_MODE'), 'should set capture mode env var');
      assert.ok(script.includes('__localpov_tee_fallback'), 'should set tee fallback flag');
    });
  });

  describe('detectShell', () => {
    it('returns a valid shell name', () => {
      const shell = detectShell();
      assert.ok(['bash', 'zsh', 'fish', 'powershell'].includes(shell),
        `Expected valid shell, got: ${shell}`);
    });
  });
});
