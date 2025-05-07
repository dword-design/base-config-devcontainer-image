import packageName from 'depcheck-package-name';
import loadPkg from 'load-pkg';
import parsePackagejsonName from 'parse-packagejson-name';

export default () => {
  const packageConfig = loadPkg.sync();
  const { scope, fullName } = parsePackagejsonName(packageConfig.name);

  const localImageName =
    fullName === 'devcontainer-image'
      ? 'devcontainer'
      : fullName.replace(/^devcontainer-image-/, '');

  const imageName = `${scope}/${localImageName}`;
  return {
    allowedMatches: ['index.json', 'index.usesdocker.spec.js'],
    ...(!packageConfig.private && {
      deployEnv: {
        DOCKER_PASSWORD: '${{ secrets.GITHUB_TOKEN }}',
        DOCKER_USERNAME: '${{ github.actor }}',
      },
      deployPlugins: [
        [
          packageName`semantic-release-docker`,
          { name: imageName, registryUrl: 'ghcr.io' },
        ],
      ],
      preDeploySteps: [
        {
          run: `npx @devcontainers/cli build --workspace-folder . --image-name ghcr.io/${imageName}:latest`,
        },
      ],
    }),
  };
};
