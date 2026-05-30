# createCommandContext

<div id="createcommandcontext" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Create a command context.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function createCommandContext&lt;&#10;  G extends GunshiParamsConstraint = DefaultGunshiParams,&#10;  V extends ArgValues&lt;ExtractArgs&lt;G&gt;&gt; = ArgValues&lt;ExtractArgs&lt;G&gt;&gt;,&#10;  C extends Command&lt;G&gt; | LazyCommand&lt;G&gt; = Command&lt;G&gt;,&#10;  E extends Record&lt;string, CommandContextExtension&gt; = &#123;&#125;&#10;&gt;(&#123;&#10;  args = &#123;&#125; as ExtractArgs&lt;G&gt;,&#10;  explicit = &#123;&#125; as ExtractArgExplicitlyProvided&lt;G&gt;,&#10;  values = &#123;&#125; as V,&#10;  positionals = [],&#10;  rest = [],&#10;  argv = [],&#10;  tokens = [],&#10;  command = &#123;&#125; as C,&#10;  extensions = &#123;&#125; as E,&#10;  cliOptions = &#123;&#125; as CliOptions&lt;G&gt;,&#10;  callMode = &#39;entry&#39;,&#10;  commandPath = [],&#10;  omitted = false,&#10;  validationError&#10;&#125;: CommandContextParams&lt;G, V, C, E&gt;): Promise&lt;CommandContextResult&lt;G, E&gt;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/context.ts#L143-L243" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">param</code>
    <code class="ox-api-entry__param-type">CommandContextParams&lt;G, V, C, E&gt;</code>
  </div>
  <p class="ox-api-entry__param-description">A <a href="/api-ox/default/interfaces/CommandContextParams.md">parameters</a> to create a command context.</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Promise&lt;CommandContextResult&lt;G, E&gt;&gt;</code>
  <p class="ox-api-entry__return-description">A <a href="/api-ox/default/interfaces/CommandContext.md">command context</a>, which is readonly.</p>
</div>
</div>
</div>
