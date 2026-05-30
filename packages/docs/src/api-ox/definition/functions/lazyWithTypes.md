# lazyWithTypes

<div id="lazywithtypes" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Define a <a href="/api-ox/definition/type-aliases/LazyCommand.md">lazy command</a> with specific type parameters.</p>
<p>This helper function allows specifying the type parameter of <a href="/api-ox/definition/interfaces/GunshiParams.md">GunshiParams</a> while inferring the <a href="/api-ox/definition/interfaces/Args.md">Args</a> type, <a href="/api-ox/definition/type-aliases/ExtendContext.md">ExtendContext</a> type from the definition.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function lazyWithTypes&lt;G extends GunshiParamsConstraint&gt;(): LazyWithTypesReturn&lt;&#10;  NormalizeToGunshiParams&lt;G&gt;&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L349-L361" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">LazyWithTypesReturn&lt;
  NormalizeToGunshiParams&lt;G&gt;
&gt;</code>
  <p class="ox-api-entry__return-description">A function that takes a lazy command definition via <a href="/api-ox/definition/functions/lazy.md">lazy</a></p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">type MyExtensions = &#123; logger: &#123; log: (message: string) =&gt; void &#125; &#125;&#10;&#10;const command = lazyWithTypes&lt;&#123; extensions: MyExtensions &#125;&gt;()(&#10;  () =&gt; &#123;&#10;    return ctx =&gt; &#123;&#10;      // Command runner implementation&#10;      ctx.extensions.logger?.log(&#39;Command executed&#39;)&#10;  &#125;,&#10; &#123;&#10;  name: &#39;lazy-command&#39;,&#10;  args: &#123;&#10;    opt: &#123;&#10;      type: &#39;string&#39;,&#10;      description: &#39;An optional string argument&#39;,&#10;      required: false,&#10;    &#125;,&#10;  &#125;,&#10;)</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A <a href="/api-ox/definition/interfaces/GunshiParams.md">GunshiParams</a> type</span></li></ul>
</div>
</div>
