# Prettify

<div id="prettify" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Prettify a type by flattening its structure.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type Prettify&lt;T&gt; = &#123; [K in keyof T]: T[K] &#125; &amp; &#123;&#125;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L23" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - The type to be prettified.</span></li></ul>
</div>
</div>
