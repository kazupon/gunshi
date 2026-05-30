# cli

<div id="cli" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Run the command.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function cli&lt;G extends GunshiParams = DefaultGunshiParams&gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options: CliOptions&lt;G&gt; = &#123;&#125;): Promise&lt;string | undefined&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L126-L133" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">args</code>
    <code class="ox-api-entry__param-type">string[]</code>
  </div>
  <p class="ox-api-entry__param-description">Command line arguments</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">entry</code>
    <code class="ox-api-entry__param-type">Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;</code>
  </div>
  <p class="ox-api-entry__param-description">A <a href="/api-ox/default/interfaces/Command.md">entry command</a>, an <a href="/api-ox/default/type-aliases/CommandRunner.md">inline command runner</a>, or a <a href="/api-ox/default/type-aliases/LazyCommand.md">lazily-loaded command</a></p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">options</code>
    <code class="ox-api-entry__param-type">CliOptions&lt;G&gt;</code>
  </div>
  <p class="ox-api-entry__param-description">A <a href="/api-ox/default/interfaces/CliOptions.md">CLI options</a> — optional · default: {}</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Promise&lt;string | undefined&gt;</code>
  <p class="ox-api-entry__return-description">A rendered usage or undefined. if you will use <a href="/api-ox/default/interfaces/CliOptions.md#property-usagesilent"><code>CliOptions.usageSilent</code></a> option, it will return rendered usage string.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of command and cli options.</span></li></ul>
</div>
</div>
