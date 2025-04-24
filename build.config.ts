import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/cli', 'src/dirs'],
  declaration: false,
  clean: true,
  rollup: {
    emitCJS: true
  }
});
