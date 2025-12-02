import { expect, test } from '@playwright/test';
import { execaCommand } from 'execa';
import outputFiles from 'output-files';
import { v4 as uuid } from 'uuid';

test('works @usesdocker', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  const name = uuid();

  await outputFiles(cwd, {
    '.baserc.json': JSON.stringify('../../src'),
    'index.json': JSON.stringify({ image: 'alpine' }),
    'index.spec.ts': '',
    'package.json': JSON.stringify({ name: `@foo/${name}` }),
  });

  await execaCommand('base checkUnknownFiles', { cwd });

  try {
    await execaCommand('base build', { cwd });

    const { stdout: jsonStrings } = await execaCommand(
      'docker image ls --format json',
      { cwd, stderr: 'inherit' },
    );

    const images = jsonStrings
      .split('\n')
      .map(jsonString => JSON.parse(jsonString))
      .map(json => json.Repository);

    expect(images).toContain(`dworddesign/${name}`);
  } finally {
    await execaCommand(`docker image rm dworddesign/${name}`, { cwd });
  }
});
