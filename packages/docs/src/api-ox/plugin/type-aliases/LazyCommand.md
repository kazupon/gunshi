# LazyCommand

<div id="lazycommand" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Lazy command interface.</p>
<p>Lazy command that&#39;s not loaded until it is executed.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type LazyCommand&lt;&#10;  G extends GunshiParamsConstraint = DefaultGunshiParams,&#10;  D extends Partial&lt;Command&lt;G&gt;&gt; = &#123;&#125;&#10;&gt; = &#123;&#10;  /**&#10;   * Command load function&#10;   */&#10;  (): Awaitable&lt;Command&lt;G&gt; | CommandRunner&lt;G&gt;&gt;&#10;&#125; &amp;&#10;  // If definition has name, commandName is required with that type&#10;  (D extends &#123; name: infer N &#125; ? &#123; commandName: N &#125; : &#123; commandName?: string &#125;) &amp;&#10;  // Properties from the definition (if provided inline)&#10;  Omit&lt;D, &#39;name&#39; | &#39;run&#39;&gt; &amp;&#10;  // Remaining properties from Command (optional)&#10;  Partial&lt;Omit&lt;Command&lt;G&gt;, keyof D | &#39;run&#39; | &#39;name&#39;&gt;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L623-L637" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - The Gunshi parameters constraint</span></li></ul>
</div>
</div>
