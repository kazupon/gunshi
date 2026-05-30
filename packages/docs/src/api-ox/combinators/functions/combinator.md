# combinator

<div id="combinator" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Create a custom argument schema with a user-defined parse function.</p>
<p>This is the most general custom combinator. Use it when none of the built-in base combinators (<a href="/api-ox/combinators/functions/string.md">string</a>, <a href="/api-ox/combinators/functions/number.md">number</a>, <a href="/api-ox/combinators/functions/integer.md">integer</a>, <a href="/api-ox/combinators/functions/float.md">float</a>, <a href="/api-ox/combinators/functions/boolean.md">boolean</a>, <a href="/api-ox/combinators/functions/choice.md">choice</a>) fit your needs.</p>
<p>The returned schema has <code>type: &#39;custom&#39;</code>.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare function combinator&lt;T&gt;(config: CombinatorOptions&lt;T&gt;): CombinatorSchema&lt;T&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts#L339" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">config</code>
    <code class="ox-api-entry__param-type">CombinatorOptions&lt;T&gt;</code>
  </div>
  <p class="ox-api-entry__param-description">Configuration with a parse function and optional metavar.</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">CombinatorSchema&lt;T&gt;</code>
  <p class="ox-api-entry__return-description">A combinator schema that resolves to the parse function&#39;s return type.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">const date = combinator(&#123;&#10;  parse: (value) =&gt; &#123;&#10;    const d = new Date(value)&#10;    if (isNaN(d.getTime())) &#123;&#10;      throw new Error(&#39;Invalid date format&#39;)&#10;    &#125;&#10;    return d&#10;  &#125;,&#10;  metavar: &#39;date&#39;&#10;&#125;)</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@experimental</span><span class="ox-api-entry__tag-value"></span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - The parsed value type.</span></li></ul>
</div>
</div>
