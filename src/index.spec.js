import { expect } from '@playwright/test';
import { execaCommand } from 'execa';
import outputFiles from 'output-files';
import { test } from 'playwright-local-tmp-dir';
import { v4 as uuid } from 'uuid';

test('works @usesdocker', async () => {
  const name = uuid();

  await outputFiles({
    '.baserc.json': JSON.stringify('../src/index.js'),
    'index.json': JSON.stringify({ image: 'alpine' }),
    'index.spec.js': '',
    'package.json': JSON.stringify({ name: `@foo/${name}` }),
  });

  await execaCommand('base checkUnknownFiles');
  await execaCommand('base build');

  const { stdout: jsonStrings } = await execaCommand(
    'docker image ls --format json',
    { stderr: 'inherit' },
  );

  const images = jsonStrings
    .split('\n')
    .map(jsonString => JSON.parse(jsonString))
    .map(json => json.Repository);

  expect(images).toContain(`dworddesign/${name}`);
});
