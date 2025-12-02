import type { Base } from '@dword-design/base';
import binName from 'depcheck-bin-name';
import packageName from 'depcheck-package-name';
import { execaCommand } from 'execa';
import parsePackagejsonName from 'parse-packagejson-name';
import { readPackageSync } from 'read-pkg';

export default function (this: Base) {
  const packageConfig = readPackageSync({ cwd: this.cwd });
  const name = parsePackagejsonName(packageConfig.name).fullName;
  const imageName = `dworddesign/${name.replace(/^docker-/, '')}`;

  const build = () => {
    execaCommand(
      `pnpm ${binName`devcontainer`} build --workspace-folder . --config index.json --image-name ${imageName}`,
      { cwd: this.cwd, stdio: 'inherit' },
    );
  };

  return {
    allowedMatches: ['Dockerfile', 'index.json', 'index.spec.ts'],
    ...(!packageConfig.private && {
      deployEnv: {
        DOCKER_PASSWORD: '${{ secrets.DOCKER_PASSWORD }}',
        DOCKER_USERNAME: '${{ secrets.DOCKER_USERNAME }}',
      },
      deployPlugins: [
        [packageName`semantic-release-docker`, { name: imageName }],
      ],
      preDeploySteps: [{ run: 'pnpm build' }],
    }),
    commands: { build, prepublishOnly: build },
  };
}
