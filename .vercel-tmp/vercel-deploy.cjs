#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const isWindows = os.platform() === 'win32';

function log(msg) { console.error(msg); }

function doDeploy(projectPath) {
  log('Starting deployment...');
  const args = ['--yes', '--prod'];
  log('Deployment environment: Production');
  log('Executing: vercel ' + args.join(' '));

  const result = spawnSync('vercel', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
    timeout: 300000,
    shell: isWindows
  });

  const output = (result.stdout || '') + (result.stderr || '');
  log(output);

  if (result.status !== 0) {
    log('Deployment failed');
    process.exit(1);
  }

  const aliasedMatch = output.match(/Aliased:\s*(https:\/\/[a-zA-Z0-9.-]+\.vercel\.app)/i);
  const deploymentMatch = output.match(/Production:\s*(https:\/\/[a-zA-Z0-9.-]+\.vercel\.app)/i);
  const finalUrl = aliasedMatch ? aliasedMatch[1] : (deploymentMatch ? deploymentMatch[1] : null);

  log('Deployment successful!');
  if (finalUrl) {
    log('Your site is live: ' + finalUrl);
    console.log(JSON.stringify({ status: 'success', url: finalUrl }));
  } else {
    console.log(JSON.stringify({ status: 'success', message: 'Deployment successful' }));
  }
}

doDeploy(path.resolve(__dirname, '..'));
