# PluginContext

<div id="plugincontext" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Gunshi plugin context interface.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface PluginContext&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/context.ts#L28-L131" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-globaloptions">
  <td><code>globalOptions</code><span class="ox-api-badge">readonly</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">Map&lt;string, ArgSchema&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Get the global options</div><div class="ox-api-entry__member-return"><span>Returns</span> A map of global options.</div></td>
</tr>
<tr id="property-subcommands">
  <td><code>subCommands</code><span class="ox-api-badge">readonly</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">ReadonlyMap&lt;string, Command&lt;G&gt; | LazyCommand&lt;G&gt;&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Get the registered sub commands</div><div class="ox-api-entry__member-return"><span>Returns</span> A map of sub commands.</div></td>
</tr>
</tbody>
</table>
</div>
<div class="ox-api-entry__member-group">
<h5>Methods</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="method-addglobaloption">
  <td><code>addGlobalOption</code></td>
  <td><span class="ox-api-entry__member-kind">method</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">addGlobalOption(name: string, schema: ArgSchema): void</code></td>
  <td><div class="ox-api-entry__member-description">Add a global option.</div><ul class="ox-api-entry__member-params"><li><code>name</code> An option name</li><li><code>schema</code> An <a href="/api-ox/default/interfaces/ArgSchema.md"><code>ArgSchema</code></a> for the option</li></ul></td>
</tr>
<tr id="method-addcommand">
  <td><code>addCommand</code></td>
  <td><span class="ox-api-entry__member-kind">method</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">addCommand(name: string, command: Command&lt;G&gt; | LazyCommand&lt;G&gt;): void</code></td>
  <td><div class="ox-api-entry__member-description">Add a sub command.</div><ul class="ox-api-entry__member-params"><li><code>name</code> Command name</li><li><code>command</code> Command definition</li></ul></td>
</tr>
<tr id="method-hascommand">
  <td><code>hasCommand</code></td>
  <td><span class="ox-api-entry__member-kind">method</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">hasCommand(name: string): boolean</code></td>
  <td><div class="ox-api-entry__member-description">Check if a command exists.</div><ul class="ox-api-entry__member-params"><li><code>name</code> Command name</li></ul><div class="ox-api-entry__member-return"><span>Returns</span> True if the command exists, false otherwise</div></td>
</tr>
<tr id="method-decorateheaderrenderer">
  <td><code>decorateHeaderRenderer</code></td>
  <td><span class="ox-api-entry__member-kind">method</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">decorateHeaderRenderer&lt;L extends Record&lt;string, unknown&gt; = DefaultGunshiParams[&#39;extensions&#39;]&gt;(decorator: (
      baseRenderer: (ctx: Readonly&lt;CommandContext&lt;MergeGunshiExtensions&lt;G, L&gt;&gt;&gt;) =&gt; Promise&lt;string&gt;,
      ctx: Readonly&lt;CommandContext&lt;MergeGunshiExtensions&lt;G, L&gt;&gt;&gt;
    ) =&gt; Promise&lt;string&gt;): void</code></td>
  <td><div class="ox-api-entry__member-description">Decorate the header renderer.</div><ul class="ox-api-entry__member-params"><li><code>decorator</code> A decorator function that wraps the base header renderer.</li></ul></td>
</tr>
<tr id="method-decorateusagerenderer">
  <td><code>decorateUsageRenderer</code></td>
  <td><span class="ox-api-entry__member-kind">method</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">decorateUsageRenderer&lt;L extends Record&lt;string, unknown&gt; = DefaultGunshiParams[&#39;extensions&#39;]&gt;(decorator: (
      baseRenderer: (ctx: Readonly&lt;CommandContext&lt;MergeGunshiExtensions&lt;G, L&gt;&gt;&gt;) =&gt; Promise&lt;string&gt;,
      ctx: Readonly&lt;CommandContext&lt;MergeGunshiExtensions&lt;G, L&gt;&gt;&gt;
    ) =&gt; Promise&lt;string&gt;): void</code></td>
  <td><div class="ox-api-entry__member-description">Decorate the usage renderer.</div><ul class="ox-api-entry__member-params"><li><code>decorator</code> A decorator function that wraps the base usage renderer.</li></ul></td>
</tr>
<tr id="method-decoratevalidationerrorsrenderer">
  <td><code>decorateValidationErrorsRenderer</code></td>
  <td><span class="ox-api-entry__member-kind">method</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">decorateValidationErrorsRenderer&lt;
    L extends Record&lt;string, unknown&gt; = DefaultGunshiParams[&#39;extensions&#39;]
  &gt;(decorator: (
      baseRenderer: (
        ctx: Readonly&lt;CommandContext&lt;MergeGunshiExtensions&lt;G, L&gt;&gt;&gt;,
        error: AggregateError
      ) =&gt; Promise&lt;string&gt;,
      ctx: Readonly&lt;CommandContext&lt;MergeGunshiExtensions&lt;G, L&gt;&gt;&gt;,
      error: AggregateError
    ) =&gt; Promise&lt;string&gt;): void</code></td>
  <td><div class="ox-api-entry__member-description">Decorate the validation errors renderer.</div><ul class="ox-api-entry__member-params"><li><code>decorator</code> A decorator function that wraps the base validation errors renderer.</li></ul></td>
</tr>
<tr id="method-decoratecommand">
  <td><code>decorateCommand</code></td>
  <td><span class="ox-api-entry__member-kind">method</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">decorateCommand&lt;L extends Record&lt;string, unknown&gt; = DefaultGunshiParams[&#39;extensions&#39;]&gt;(decorator: (
      baseRunner: (
        ctx: Readonly&lt;CommandContext&lt;MergeGunshiExtensions&lt;G, L&gt;&gt;&gt;
      ) =&gt; Awaitable&lt;void | string&gt;
    ) =&gt; (ctx: Readonly&lt;CommandContext&lt;MergeGunshiExtensions&lt;G, L&gt;&gt;&gt;) =&gt; Awaitable&lt;void | string&gt;): void</code></td>
  <td><div class="ox-api-entry__member-description">Decorate the command execution.<br><br>Decorators are applied in reverse order (last registered is executed first).</div><ul class="ox-api-entry__member-params"><li><code>decorator</code> A decorator function that wraps the command runner</li></ul></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of command parameters.</span></li></ul>
</div>
</div>
