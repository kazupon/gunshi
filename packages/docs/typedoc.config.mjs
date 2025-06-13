// @ts-check

/** @type {import('typedoc').TypeDocOptions & import('typedoc-plugin-markdown').PluginOptions & { docsRoot?: string } } */
export default {
  /**
   * typedoc options
   * ref: https://typedoc.org/documents/Options.html
   */
  entryPoints: [
    '../gunshi/src/index.ts',
    '../gunshi/src/definition.ts',
    '../gunshi/src/context.ts',
    // TODO(kazupon): when we will release the plugin, we should uncomment this line
    // '../gunshi/src/plugin.ts',
    '../gunshi/src/generator.ts',
    '../gunshi/src/renderer.ts'
  ],
  out: 'src/api',
  plugin: ['typedoc-plugin-markdown', 'typedoc-vitepress-theme'],
  readme: 'none',
  groupOrder: ['Variables', 'Functions', 'Class'],
  /**
   * typedoc-plugin-markdown options
   * ref: https://typedoc-plugin-markdown.org/docs/options
   */
  entryFileName: 'index',
  hidePageTitle: false,
  useCodeBlocks: true,
  disableSources: true,
  indexFormat: 'table',
  parametersFormat: 'table',
  interfacePropertiesFormat: 'table',
  classPropertiesFormat: 'table',
  propertyMembersFormat: 'table',
  typeAliasPropertiesFormat: 'table',
  enumMembersFormat: 'table',
  /**
   * typedoc-vitepress-theme options
   * ref: https://typedoc-plugin-markdown.org/plugins/vitepress/options
   */
  docsRoot: './src'
}
