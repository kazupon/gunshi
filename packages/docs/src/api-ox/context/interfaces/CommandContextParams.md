# CommandContextParams

<div id="commandcontextparams" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Parameters of <a href="/api-ox/context/functions/createCommandContext.md">createCommandContext</a></p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface CommandContextParams&lt;&#10;  G extends GunshiParams | &#123; args: Args &#125; | &#123; extensions: ExtendContext &#125;,&#10;  V extends ArgValues&lt;ExtractArgs&lt;G&gt;&gt;,&#10;  C extends Command&lt;G&gt; | LazyCommand&lt;G&gt; = Command&lt;G&gt;,&#10;  E extends Record&lt;string, CommandContextExtension&gt; = Record&lt;string, CommandContextExtension&gt;&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/context.ts#L71-L135" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-args">
  <td><code>args</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">ExtractArgs&lt;G&gt;</code></td>
  <td><div class="ox-api-entry__member-description">An arguments of target command</div></td>
</tr>
<tr id="property-explicit">
  <td><code>explicit</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">ExtractArgExplicitlyProvided&lt;G&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Explicitly provided arguments</div></td>
</tr>
<tr id="property-values">
  <td><code>values</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">V</code></td>
  <td><div class="ox-api-entry__member-description">A values of target command</div></td>
</tr>
<tr id="property-positionals">
  <td><code>positionals</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string[]</code></td>
  <td><div class="ox-api-entry__member-description">A positionals arguments, which passed to the target command</div></td>
</tr>
<tr id="property-rest">
  <td><code>rest</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string[]</code></td>
  <td><div class="ox-api-entry__member-description">A rest arguments, which passed to the target command</div></td>
</tr>
<tr id="property-argv">
  <td><code>argv</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string[]</code></td>
  <td><div class="ox-api-entry__member-description">Original command line arguments</div></td>
</tr>
<tr id="property-tokens">
  <td><code>tokens</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">ArgToken[]</code></td>
  <td><div class="ox-api-entry__member-description">Argument tokens that are parsed by the <code>parseArgs</code> function</div></td>
</tr>
<tr id="property-omitted">
  <td><code>omitted</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether the command is omitted</div></td>
</tr>
<tr id="property-callmode">
  <td><code>callMode</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">CommandCallMode</code></td>
  <td><div class="ox-api-entry__member-description">Command call mode.</div></td>
</tr>
<tr id="property-commandpath">
  <td><code>commandPath</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string[]</code></td>
  <td><div class="ox-api-entry__member-description">The path of nested sub-commands resolved to reach the current command.</div></td>
</tr>
<tr id="property-command">
  <td><code>command</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">C</code></td>
  <td><div class="ox-api-entry__member-description">A target command</div></td>
</tr>
<tr id="property-extensions">
  <td><code>extensions</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">E</code></td>
  <td><div class="ox-api-entry__member-description">Plugin extensions to apply as the command context extension.</div></td>
</tr>
<tr id="property-clioptions">
  <td><code>cliOptions</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">CliOptions&lt;G&gt;</code></td>
  <td><div class="ox-api-entry__member-description">A command options, which is spicialized from <code>cli</code> function</div></td>
</tr>
<tr id="property-validationerror">
  <td><code>validationError</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">AggregateError</code></td>
  <td><div class="ox-api-entry__member-description">Validation error from argument parsing.</div></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
