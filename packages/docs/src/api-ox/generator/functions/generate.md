# generate

<div id="generate" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Generate the command usage.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function generate&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(command: string | string[] | null, entry: Command&lt;G&gt; | LazyCommand&lt;G&gt;, options: GenerateOptions&lt;G&gt; = &#123;&#125;): Promise&lt;string&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/generator.ts#L45-L62" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">command</code>
    <code class="ox-api-entry__param-type">string | string[] | null</code>
  </div>
  <p class="ox-api-entry__param-description">usage generate command, if you want to generate the usage of the default command where there are target commands and sub-commands, specify <code>null</code>.</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">entry</code>
    <code class="ox-api-entry__param-type">Command&lt;G&gt; | LazyCommand&lt;G&gt;</code>
  </div>
  <p class="ox-api-entry__param-description">A <a href="/api-ox/default/interfaces/Command.md"><code>entry command</code></a></p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">options</code>
    <code class="ox-api-entry__param-type">GenerateOptions&lt;G&gt;</code>
  </div>
  <p class="ox-api-entry__param-description">A <a href="/api-ox/generator/type-aliases/GenerateOptions.md"><code>cli options</code></a> — optional · default: {}</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Promise&lt;string&gt;</code>
  <p class="ox-api-entry__return-description">A rendered usage.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of command parameters.</span></li></ul>
</div>
</div>
