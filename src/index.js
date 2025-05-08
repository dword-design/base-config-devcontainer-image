import binName from 'depcheck-bin-name';
import packageName from 'depcheck-package-name';
import { execaCommand } from 'execa';
import loadPkg from 'load-pkg';
import parsePackagejsonName from 'parse-packagejson-name';

export default () => {
  const packageConfig = loadPkg.sync();
  const name = parsePackagejsonName(packageConfig.name).fullName;
  const imageName = `dworddesign/${name.replace(/^docker-/, '')}`;

  const build = () => {
    execaCommand(
      `pnpm ${binName`devcontainer`} build --workspace-folder . --config index.json --image-name ${imageName}`,
    );
  };

  return {
    allowedMatches: ['index.json', 'index.spec.js'],
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
};
