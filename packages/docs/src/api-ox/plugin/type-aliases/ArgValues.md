# ArgValues

<div id="argvalues" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>An object that contains the values of the arguments.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">type ArgValues&lt;T&gt; = T extends Args ? ResolveArgValues&lt;T, &#123; [Arg in keyof T]: ExtractOptionValue&lt;T[Arg]&gt; &#125;&gt; : &#123;&#10;  [option: string]: string | boolean | number | (string | boolean | number)[] | undefined;&#10;&#125;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts#L441-L443" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - <a href="/api-ox/plugin/interfaces/Args.md">Arguments</a> which is an object that defines the command line arguments.</span></li></ul>
</div>
</div>
