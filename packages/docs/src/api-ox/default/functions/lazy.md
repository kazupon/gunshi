# lazy

<div id="lazy" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Define a <a href="/api-ox/default/type-aliases/LazyCommand.md">lazy command</a> with or without definition.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function lazy&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(loader: CommandLoader&lt;G&gt;, definition?: Partial&lt;Command&lt;G&gt;&gt;): LazyCommand&lt;G, any&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L274-L299" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">loader</code>
    <code class="ox-api-entry__param-type">CommandLoader&lt;G&gt;</code>
  </div>
  <p class="ox-api-entry__param-description">A <a href="/api-ox/default/type-aliases/CommandLoader.md">command loader</a> function that returns a command definition</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">definition</code>
    <code class="ox-api-entry__param-type">Partial&lt;Command&lt;G&gt;&gt;</code>
  </div>
  <p class="ox-api-entry__param-description">An optional <a href="/api-ox/default/interfaces/Command.md">command</a> definition — optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">LazyCommand&lt;G, any&gt;</code>
  <p class="ox-api-entry__return-description">A <a href="/api-ox/default/type-aliases/LazyCommand.md">lazy command</a> that can be executed later</p>
</div>
</div>
</div>
