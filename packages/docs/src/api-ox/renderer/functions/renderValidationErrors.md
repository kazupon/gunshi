# renderValidationErrors

<div id="rendervalidationerrors" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Render the validation errors.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare function renderValidationErrors&lt;G extends GunshiParams = DefaultGunshiParams&gt;(_ctx: CommandContext&lt;G&gt;, error: AggregateError): Promise&lt;string&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/plugin-renderer/lib/index.d.ts#L180" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">_ctx</code>
    <code class="ox-api-entry__param-type">CommandContext&lt;G&gt;</code>
  </div>
  <p class="ox-api-entry__param-description">A <a href="/api-ox/default/interfaces/CommandContext.md">command context</a></p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">error</code>
    <code class="ox-api-entry__param-type">AggregateError</code>
  </div>
  <p class="ox-api-entry__param-description">An AggregateError of option in <code>args-token</code> validation</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Promise&lt;string&gt;</code>
  <p class="ox-api-entry__return-description">A rendered validation error.</p>
</div>
</div>
</div>
