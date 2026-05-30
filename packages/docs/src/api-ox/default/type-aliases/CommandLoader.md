# CommandLoader

<div id="commandloader" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Command loader.</p>
<p>A function that returns a command or command runner. This is used to lazily load commands.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type CommandLoader&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = () =&gt; Awaitable&lt;&#10;  Command&lt;G&gt; | CommandRunner&lt;G&gt;&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L744-L746" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">A command or command runner</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of command context and command runner.</span></li></ul>
</div>
</div>
