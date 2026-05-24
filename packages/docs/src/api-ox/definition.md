# definition.ts

**[Source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts)**

> 11 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>11</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>7</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>4</strong>
  <span>types</span>
</span>
<span class="ox-api-stat">
  <strong>7</strong>
  <span>parameters</span>
</span>
<span class="ox-api-stat">
  <strong>7</strong>
  <span>returns</span>
</span>
<span class="ox-api-stat">
  <strong>5</strong>
  <span>examples</span>
</span>
</div>

## Reference

<div class="ox-api-controls" data-ox-api-target=".ox-api-entry" role="toolbar" aria-label="Reference display controls">
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="expand">Open all</button>
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="collapse">Close all</button>
</div>

<details v-pre id="commanddefinition" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CommandDefinition&lt; A extends Args, E extends ExtendContext, C extends Partial&lt;Command&lt;{ args: A; extensions: E }&gt;&gt; &gt; = C &amp; Command&lt;{ args: A; extensions: E }&gt;</code><span class="ox-api-entry__description">The command definition accepted by {@link define} helpers.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>The command definition accepted by {@link define} helpers.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">type CommandDefinition&lt;&#10;  A extends Args,&#10;  E extends ExtendContext,&#10;  C extends Partial&lt;Command&lt;&#123; args: A; extensions: E &#125;&gt;&gt;&#10;&gt; = C &amp; Command&lt;&#123; args: A; extensions: E &#125;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L85-L89">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="commanddefinitionresult" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CommandDefinitionResult&lt; G extends GunshiParamsConstraint = DefaultGunshiParams, C = {} &gt; = Prettify&lt;Pick&lt;C, keyof C&gt; &amp; Partial&lt;Pick&lt;Command&lt;G&gt;, Exclude&lt;keyof Command&lt;G&gt;, keyof C&gt;&gt;&gt;&gt;</code><span class="ox-api-entry__description">The result type of the {@link define} function</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>The result type of the {@link define} function</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">type CommandDefinitionResult&lt;&#10;  G extends GunshiParamsConstraint = DefaultGunshiParams,&#10;  C = &#123;&#125;&#10;&gt; = Prettify&lt;Pick&lt;C, keyof C&gt; &amp; Partial&lt;Pick&lt;Command&lt;G&gt;, Exclude&lt;keyof Command&lt;G&gt;, keyof C&gt;&gt;&gt;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L75-L78">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="define" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">define&lt; G extends GunshiParamsConstraint = DefaultGunshiParams, A extends Args = ExtractArgs&lt;G&gt;, C extends Partial&lt;Command&lt;{ args: A; extensions: ExtractExtensions&lt;G&gt; }&gt;&gt; = {} &gt;(definition: CommandDefinition&lt;A, ExtractExtensions&lt;G&gt;, C&gt;): CommandDefinitionResult&lt;G, C&gt;</code><span class="ox-api-entry__description">Define a {@link Command | command}.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns CommandDefinitionResult</span><span class="ox-api-badge">1 example</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Define a {@link Command | command}.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function define&lt;&#10;  G extends GunshiParamsConstraint = DefaultGunshiParams,&#10;  A extends Args = ExtractArgs&lt;G&gt;,&#10;  C extends Partial&lt;Command&lt;&#123; args: A; extensions: ExtractExtensions&lt;G&gt; &#125;&gt;&gt; = &#123;&#125;&#10;&gt;(definition: CommandDefinition&lt;A, ExtractExtensions&lt;G&gt;, C&gt;): CommandDefinitionResult&lt;G, C&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L121-L125">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">definition</code>
    <code class="ox-api-entry__param-type">CommandDefinition</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link Command | command} definition</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">CommandDefinitionResult</code>
  <p class="ox-api-entry__return-description">A defined {@link Command | command}</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">const command = define(&#123;&#10;  name: &#39;test&#39;,&#10;  description: &#39;A test command&#39;,&#10;  args: &#123;&#10;    debug: &#123;&#10;      type: &#39;boolean&#39;,&#10;      description: &#39;Enable debug mode&#39;,&#10;      default: false&#10;    &#125;&#10;  &#125;,&#10;  run: ctx =&gt; &#123;&#10;    if (ctx.values.debug) &#123;&#10;      console.debug(&#39;Debug mode is enabled&#39;);&#10;    &#125;&#10;  &#125;&#10;&#125;)</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A {@link GunshiParamsConstraint} type</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="define" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">define(definition: any): any</code><span class="ox-api-entry__description">Define a {@link Command | command}.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns any</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Define a {@link Command | command}.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function define(definition: any): any</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L135-L137">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">definition</code>
    <code class="ox-api-entry__param-type">any</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link Command | command} definition</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">any</code>
  <p class="ox-api-entry__return-description">A defined {@link Command | command}</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A {@link GunshiParamsConstraint} type</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="definewithtypes" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">defineWithTypes&lt;G extends GunshiParamsConstraint&gt;(): DefineWithTypesReturn&lt; ExtractExtensions&lt;G&gt;, ExtractArgs&lt;G&gt; &gt;</code><span class="ox-api-entry__description">Define a {@link Command | command} with types This helper function allows speci…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">returns DefineWithTypesReturn</span><span class="ox-api-badge">1 example</span><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Define a {@link Command | command} with types</p>
<p>This helper function allows specifying the type parameter of {@link GunshiParams} while inferring the {@link Args} type, {@link ExtendContext} type from the definition.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function defineWithTypes&lt;G extends GunshiParamsConstraint&gt;(): DefineWithTypesReturn&lt;&#10;  ExtractExtensions&lt;G&gt;,&#10;  ExtractArgs&lt;G&gt;&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L182-L201">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">DefineWithTypesReturn</code>
  <p class="ox-api-entry__return-description">A function that takes a command definition via {@link define}</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">// Define a command with specific extensions type&#10;type MyExtensions = &#123; logger: &#123; log: (message: string) =&gt; void &#125; &#125;&#10;&#10;const command = defineWithTypes&lt;&#123; extensions: MyExtensions &#125;&gt;()(&#123;&#10;  name: &#39;greet&#39;,&#10;  args: &#123;&#10;    name: &#123; type: &#39;string&#39; &#125;&#10;  &#125;,&#10;  run: ctx =&gt; &#123;&#10;    // ctx.values is inferred as &#123; name?: string &#125;&#10;    // ctx.extensions is MyExtensions&#10;  &#125;&#10;&#125;)</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A {@link GunshiParams} type</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="definewithtypesreturn" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">DefineWithTypesReturn&lt;DefaultExtensions extends ExtendContext, DefaultArgs extends Args&gt; = &lt; A extends DefaultArgs = DefaultArgs, C extends Partial&lt;Command&lt;{ args: A; extensions: DefaultExtensions }&gt;&gt; = {} &gt;( definition: CommandDefinition&lt;A, DefaultExtensions, C&gt; ) =&gt; CommandDefinitionResult&lt;{ args: A; extensions: DefaultExtensions }, C&gt;</code><span class="ox-api-entry__description">Return type for defineWithTypes</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Return type for defineWithTypes</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">type DefineWithTypesReturn&lt;DefaultExtensions extends ExtendContext, DefaultArgs extends Args&gt; = &lt;&#10;  A extends DefaultArgs = DefaultArgs,&#10;  C extends Partial&lt;Command&lt;&#123; args: A; extensions: DefaultExtensions &#125;&gt;&gt; = &#123;&#125;&#10;&gt;(&#10;  definition: CommandDefinition&lt;A, DefaultExtensions, C&gt;&#10;) =&gt; CommandDefinitionResult&lt;&#123; args: A; extensions: DefaultExtensions &#125;, C&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L146-L151">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">DefaultExtensions - The {@link ExtendContext} type extracted from G</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="lazy" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">lazy&lt;A extends Args&gt;(loader: CommandLoader&lt;{ args: A; extensions: {} }&gt;): LazyCommand&lt;{ args: A; extensions: {} }, {}&gt;</code><span class="ox-api-entry__description">Define a {@link LazyCommand | lazy command}.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns LazyCommand</span><span class="ox-api-badge">1 example</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Define a {@link LazyCommand | lazy command}.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function lazy&lt;A extends Args&gt;(loader: CommandLoader&lt;&#123; args: A; extensions: &#123;&#125; &#125;&gt;): LazyCommand&lt;&#123; args: A; extensions: &#123;&#125; &#125;, &#123;&#125;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L217-L219">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">loader</code>
    <code class="ox-api-entry__param-type">CommandLoader</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link CommandLoader | command loader}</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">LazyCommand</code>
  <p class="ox-api-entry__return-description">A {@link LazyCommand | lazy command} with loader</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">// load command with dynamic importing&#10;const test = lazy(() =&gt; import(&#39;./commands/test&#39;))</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">A - An {@link Args} type</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="lazy" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">lazy&lt; G extends GunshiParamsConstraint = DefaultGunshiParams, A extends ExtractArgs&lt;G&gt; = ExtractArgs&lt;G&gt;, D extends Partial&lt;Command&lt;{ args: A; extensions: {} }&gt;&gt; = Partial&lt; Command&lt;{ args: A; extensions: {} }&gt; &gt; &gt;(loader: CommandLoader&lt;{ args: A; extensions: {} }&gt;, definition: D): LazyCommand&lt;{ args: A; extensions: {} }, D&gt;</code><span class="ox-api-entry__description">Define a {@link LazyCommand | lazy command} with definition.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">2 params</span><span class="ox-api-badge">returns LazyCommand</span><span class="ox-api-badge">1 example</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Define a {@link LazyCommand | lazy command} with definition.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function lazy&lt;&#10;  G extends GunshiParamsConstraint = DefaultGunshiParams,&#10;  A extends ExtractArgs&lt;G&gt; = ExtractArgs&lt;G&gt;,&#10;  D extends Partial&lt;Command&lt;&#123; args: A; extensions: &#123;&#125; &#125;&gt;&gt; = Partial&lt;&#10;    Command&lt;&#123; args: A; extensions: &#123;&#125; &#125;&gt;&#10;  &gt;&#10;&gt;(loader: CommandLoader&lt;&#123; args: A; extensions: &#123;&#125; &#125;&gt;, definition: D): LazyCommand&lt;&#123; args: A; extensions: &#123;&#125; &#125;, D&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L256-L265">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">loader</code>
    <code class="ox-api-entry__param-type">CommandLoader</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link CommandLoader | command loader} function that returns a command definition</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">definition</code>
    <code class="ox-api-entry__param-type">D</code>
  </div>
  <p class="ox-api-entry__param-description">An optional {@link Command | command} definition</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">LazyCommand</code>
  <p class="ox-api-entry__return-description">A {@link LazyCommand | lazy command} that can be executed later</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">// define command without command runner&#10;const testDefinition = define(&#123;&#10;  name: &#39;test&#39;,&#10;  description: &#39;Test command&#39;,&#10;  args: &#123;&#10;    debug: &#123;&#10;      type: &#39;boolean&#39;,&#10;      description: &#39;Enable debug mode&#39;,&#10;      default: false&#10;    &#125;&#10;  &#125;,&#10;&#125;)&#10;&#10;// define load command with command runner and defined command&#10;const test = lazy((): CommandRunner&lt;&#123; args: typeof testDefinition.args; extensions: &#123;&#125; &#125;&gt; =&gt; &#123;&#10;  return ctx =&gt; &#123;&#10;    if (ctx.values.debug) &#123;&#10;      console.debug(&#39;Debug mode is enabled&#39;);&#10;    &#125;&#10;  &#125;&#10;&#125;, testDefinition)</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">A - An {@link Args} type</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="lazy" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">lazy&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(loader: CommandLoader&lt;G&gt;, definition?: Partial&lt;Command&lt;G&gt;&gt;): LazyCommand&lt;G, any&gt;</code><span class="ox-api-entry__description">Define a {@link LazyCommand | lazy command} with or without definition.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">2 params</span><span class="ox-api-badge">returns LazyCommand</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Define a {@link LazyCommand | lazy command} with or without definition.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function lazy&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(loader: CommandLoader&lt;G&gt;, definition?: Partial&lt;Command&lt;G&gt;&gt;): LazyCommand&lt;G, any&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L274-L299">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">loader</code>
    <code class="ox-api-entry__param-type">CommandLoader</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link CommandLoader | command loader} function that returns a command definition</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">definition</code>
    <code class="ox-api-entry__param-type">Partial</code>
  </div>
  <p class="ox-api-entry__param-description">An optional {@link Command | command} definition — optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">LazyCommand</code>
  <p class="ox-api-entry__return-description">A {@link LazyCommand | lazy command} that can be executed later</p>
</div>
</div>
  </div>
</details>

<details v-pre id="lazywithtypes" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">lazyWithTypes&lt;G extends GunshiParamsConstraint&gt;(): LazyWithTypesReturn&lt; NormalizeToGunshiParams&lt;G&gt; &gt;</code><span class="ox-api-entry__description">Define a {@link LazyCommand | lazy command} with specific type parameters. This…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">returns LazyWithTypesReturn</span><span class="ox-api-badge">1 example</span><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Define a {@link LazyCommand | lazy command} with specific type parameters.</p>
<p>This helper function allows specifying the type parameter of {@link GunshiParams} while inferring the {@link Args} type, {@link ExtendContext} type from the definition.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function lazyWithTypes&lt;G extends GunshiParamsConstraint&gt;(): LazyWithTypesReturn&lt;&#10;  NormalizeToGunshiParams&lt;G&gt;&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L349-L361">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">LazyWithTypesReturn</code>
  <p class="ox-api-entry__return-description">A function that takes a lazy command definition via {@link lazy}</p>
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
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A {@link GunshiParams} type</span></li><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="lazywithtypesreturn" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">LazyWithTypesReturn&lt;FullG extends GunshiParamsConstraint&gt; = &lt; D extends Partial&lt;Command&lt;FullG&gt;&gt; = {} &gt;( loader: CommandLoader&lt;FullG&gt;, definition?: D ) =&gt; LazyCommand&lt;FullG, D&gt;</code><span class="ox-api-entry__description">Return type for lazyWithTypes</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Return type for lazyWithTypes</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">type LazyWithTypesReturn&lt;FullG extends GunshiParamsConstraint&gt; = &lt;&#10;  D extends Partial&lt;Command&lt;FullG&gt;&gt; = &#123;&#125;&#10;&gt;(&#10;  loader: CommandLoader&lt;FullG&gt;,&#10;  definition?: D&#10;) =&gt; LazyCommand&lt;FullG, D&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L308-L313">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">FullG - The normalized {@link GunshiParams} type</span></li></ul>
</div>
  </div>
</details>
