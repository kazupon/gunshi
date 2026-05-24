# core.ts

**[Source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts)**

> 18 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>18</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>3</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>4</strong>
  <span>interfaces</span>
</span>
<span class="ox-api-stat">
  <strong>11</strong>
  <span>types</span>
</span>
<span class="ox-api-stat">
  <strong>8</strong>
  <span>parameters</span>
</span>
<span class="ox-api-stat">
  <strong>5</strong>
  <span>returns</span>
</span>
</div>

## Reference

<div class="ox-api-controls" data-ox-api-target=".ox-api-entry" role="toolbar" aria-label="Reference display controls">
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="expand">Open all</button>
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="collapse">Close all</button>
</div>

<details v-pre id="dependencyextensions" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">DependencyExtensions&lt; Deps extends ReadonlyArray&lt;PluginDependency | string&gt;, Context extends ExtendContext &gt; = InferDependencyExtensions&lt;Deps, Context&gt;</code><span class="ox-api-entry__description">Extensions resolved from the declared plugin dependencies.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Extensions resolved from the declared plugin dependencies.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">type DependencyExtensions&lt;&#10;  Deps extends ReadonlyArray&lt;PluginDependency | string&gt;,&#10;  Context extends ExtendContext&#10;&gt; = InferDependencyExtensions&lt;Deps, Context&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L155-L158">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="dependencyparams" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">DependencyParams&lt; Deps extends ReadonlyArray&lt;PluginDependency | string&gt;, Context extends ExtendContext &gt; = GunshiParams&lt;{ args: Args extensions: DependencyExtensions&lt;Deps, Context&gt; }&gt;</code><span class="ox-api-entry__description">Gunshi params available while a plugin extension resolves its dependencies.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Gunshi params available while a plugin extension resolves its dependencies.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">type DependencyParams&lt;&#10;  Deps extends ReadonlyArray&lt;PluginDependency | string&gt;,&#10;  Context extends ExtendContext&#10;&gt; = GunshiParams&lt;&#123;&#10;  args: Args&#10;  extensions: DependencyExtensions&lt;Deps, Context&gt;&#10;&#125;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L165-L171">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="extractdependencyid" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">ExtractDependencyId&lt;D&gt; = D extends PluginDependency ? D[&#39;id&#39;] : D extends string ? D : never</code><span class="ox-api-entry__description">Helper type to extract plugin ID from dependency</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Helper type to extract plugin ID from dependency</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type ExtractDependencyId&lt;D&gt; = D extends PluginDependency&#10;  ? D[&#39;id&#39;]&#10;  : D extends string&#10;    ? D&#10;    : never</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L28-L32">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="inferdependencyextensions" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">InferDependencyExtensions&lt; D extends ReadonlyArray&lt;PluginDependency | string&gt;, A extends ExtendContext &gt; = D extends readonly [] ? {} : D extends readonly [infer First, ...infer Rest] ? ProcessDependency&lt;First, A&gt; &amp; (Rest extends ReadonlyArray&lt;PluginDependency | string&gt; ? InferDependencyExtensions&lt;Rest, A&gt; : {}) : {}</code><span class="ox-api-entry__description">Helper type to infer dependency extensions with optional support</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Helper type to infer dependency extensions with optional support</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type InferDependencyExtensions&lt;&#10;  D extends ReadonlyArray&lt;PluginDependency | string&gt;,&#10;  A extends ExtendContext&#10;&gt; = D extends readonly []&#10;  ? &#123;&#125;&#10;  : D extends readonly [infer First, ...infer Rest]&#10;    ? ProcessDependency&lt;First, A&gt; &amp;&#10;        (Rest extends ReadonlyArray&lt;PluginDependency | string&gt;&#10;          ? InferDependencyExtensions&lt;Rest, A&gt;&#10;          : &#123;&#125;)&#10;    : &#123;&#125;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L64-L74">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="isoptionaldependency" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">IsOptionalDependency&lt;D&gt; = D extends PluginDependency ? D[&#39;optional&#39;] extends true ? true : false : false</code><span class="ox-api-entry__description">Helper type to check if dependency is optional</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Helper type to check if dependency is optional</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type IsOptionalDependency&lt;D&gt; = D extends PluginDependency&#10;  ? D[&#39;optional&#39;] extends true&#10;    ? true&#10;    : false&#10;  : false</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L39-L43">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="mergedpluginextensions" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">MergedPluginExtensions&lt; Id extends string, Deps extends ReadonlyArray&lt;PluginDependency | string&gt;, Context extends ExtendContext, Ext extends ExtendContext &gt; = MergeExtension&lt;Id, DependencyExtensions&lt;Deps, Context&gt;, Ext&gt;</code><span class="ox-api-entry__description">Extensions available after applying the current plugin extension.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Extensions available after applying the current plugin extension.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">type MergedPluginExtensions&lt;&#10;  Id extends string,&#10;  Deps extends ReadonlyArray&lt;PluginDependency | string&gt;,&#10;  Context extends ExtendContext,&#10;  Ext extends ExtendContext&#10;&gt; = MergeExtension&lt;Id, DependencyExtensions&lt;Deps, Context&gt;, Ext&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L178-L183">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="mergedpluginparams" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">MergedPluginParams&lt; Id extends string, Deps extends ReadonlyArray&lt;PluginDependency | string&gt;, Context extends ExtendContext, Ext extends ExtendContext &gt; = GunshiParams&lt;{ args: Args extensions: MergedPluginExtensions&lt;Id, Deps, Context, Ext&gt; }&gt;</code><span class="ox-api-entry__description">Gunshi params available after applying the current plugin extension.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Gunshi params available after applying the current plugin extension.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">type MergedPluginParams&lt;&#10;  Id extends string,&#10;  Deps extends ReadonlyArray&lt;PluginDependency | string&gt;,&#10;  Context extends ExtendContext,&#10;  Ext extends ExtendContext&#10;&gt; = GunshiParams&lt;&#123;&#10;  args: Args&#10;  extensions: MergedPluginExtensions&lt;Id, Deps, Context, Ext&gt;&#10;&#125;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L190-L198">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="onpluginextension" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">OnPluginExtension&lt;G extends GunshiParams = DefaultGunshiParams&gt; = ( ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;, cmd: Readonly&lt;Command&lt;G&gt;&gt; ) =&gt; Awaitable&lt;void&gt;</code><span class="ox-api-entry__description">Plugin extension callback, which is called when the plugin is extended with `ex…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">2 params</span><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Plugin extension callback, which is called when the plugin is extended with <code>extension</code> option.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type OnPluginExtension&lt;G extends GunshiParams = DefaultGunshiParams&gt; = (&#10;  ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;,&#10;  cmd: Readonly&lt;Command&lt;G&gt;&gt;&#10;) =&gt; Awaitable&lt;void&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L131-L134">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ctx</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The {@linkcode CommandContext | command context}</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">cmd</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The {@linkcode Command | command}</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of {@linkcode CommandContext} and {@linkcode Command}.</span></li><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="plugin" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">Plugin&lt;E extends GunshiParams[&#39;extensions&#39;] = DefaultGunshiParams[&#39;extensions&#39;]&gt; = PluginFunction &amp; { id: string name?: string dependencies?: (PluginDependency | string)[] extension?: CommandContextExtension&lt;E&gt; }</code><span class="ox-api-entry__description">Gunshi plugin, which is a function that receives a PluginContext.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns unknown</span><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Gunshi plugin, which is a function that receives a PluginContext.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type Plugin&lt;E extends GunshiParams[&#39;extensions&#39;] = DefaultGunshiParams[&#39;extensions&#39;]&gt; = PluginFunction &amp; &#123;&#10;    id: string&#10;    name?: string&#10;    dependencies?: (PluginDependency | string)[]&#10;    extension?: CommandContextExtension&lt;E&gt;&#10;  &#125;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L255-L261">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ctx</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">A {@linkcode PluginContext}.</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">An {@linkcode Awaitable} that resolves when the plugin is loaded.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">E - A type extending {@link GunshiParams} to specify the shape of {@linkcode CommandContext}&#39;s extensions.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="plugin" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">plugin&lt; Context extends ExtendContext = DefaultGunshiParams[&#39;extensions&#39;], // for plugin dependency extensions Id extends string = string, // for plugin id Deps extends ReadonlyArray&lt;PluginDependency | string&gt; = [], // for plugin dependencies Extension extends {} = {}, // for plugin extension type ResolvedDepExtensions extends GunshiParams = DependencyParams&lt;Deps, Context&gt;, PluginExt extends PluginExtension&lt;Extension, DefaultGunshiParams&gt; = PluginExtension&lt; Extension, ResolvedDepExtensions &gt;, MergedExtensions extends GunshiParams = MergedPluginParams&lt; Id, Deps, Context, Awaited&lt;ReturnType&lt;PluginExt&gt;&gt; &gt; &gt;(options: { id: Id name?: string dependencies?: Deps setup?: ( ctx: Readonly&lt; PluginContext&lt;MergedPluginParams&lt;Id, Deps, Context, Awaited&lt;ReturnType&lt;PluginExt&gt;&gt;&gt;&gt; &gt; ) =&gt; Awaitable&lt;void&gt; extension: PluginExt onExtension?: OnPluginExtension&lt;MergedExtensions&gt; }): PluginWithExtension&lt;Awaited&lt;ReturnType&lt;PluginExt&gt;&gt;&gt;</code><span class="ox-api-entry__description">Define a plugin with extension compatibility and typed dependency extensions</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns PluginWithExtension</span><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Define a plugin with extension compatibility and typed dependency extensions</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function plugin&lt;&#10;  Context extends ExtendContext = DefaultGunshiParams[&#39;extensions&#39;], // for plugin dependency extensions&#10;  Id extends string = string, // for plugin id&#10;  Deps extends ReadonlyArray&lt;PluginDependency | string&gt; = [], // for plugin dependencies&#10;  Extension extends &#123;&#125; = &#123;&#125;, // for plugin extension type&#10;  ResolvedDepExtensions extends GunshiParams = DependencyParams&lt;Deps, Context&gt;,&#10;  PluginExt extends PluginExtension&lt;Extension, DefaultGunshiParams&gt; = PluginExtension&lt;&#10;    Extension,&#10;    ResolvedDepExtensions&#10;  &gt;,&#10;  MergedExtensions extends GunshiParams = MergedPluginParams&lt;&#10;    Id,&#10;    Deps,&#10;    Context,&#10;    Awaited&lt;ReturnType&lt;PluginExt&gt;&gt;&#10;  &gt;&#10;&gt;(options: &#123;&#10;  id: Id&#10;  name?: string&#10;  dependencies?: Deps&#10;  setup?: (&#10;    ctx: Readonly&lt;&#10;      PluginContext&lt;MergedPluginParams&lt;Id, Deps, Context, Awaited&lt;ReturnType&lt;PluginExt&gt;&gt;&gt;&gt;&#10;    &gt;&#10;  ) =&gt; Awaitable&lt;void&gt;&#10;  extension: PluginExt&#10;  onExtension?: OnPluginExtension&lt;MergedExtensions&gt;&#10;&#125;): PluginWithExtension&lt;Awaited&lt;ReturnType&lt;PluginExt&gt;&gt;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L328-L355">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">options</code>
    <code class="ox-api-entry__param-type">{ ... }</code>
  </div>
  <p class="ox-api-entry__param-description">{@linkcode PluginOptions | plugin options}</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">PluginWithExtension</code>
  <p class="ox-api-entry__return-description">A defined plugin with extension</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">Context - A type extending {@linkcode ExtendContext} to specify the shape of plugin dependency extensions.</span></li><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="plugin" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">plugin&lt; Context extends ExtendContext = DefaultGunshiParams[&#39;extensions&#39;], // for plugin dependency extensions Id extends string = string, // for plugin id Deps extends ReadonlyArray&lt;PluginDependency | string&gt; = [], // for plugin dependencies Extension extends Record&lt;string, unknown&gt; = {}, // for plugin extension type ResolvedDepExtensions extends GunshiParams = DependencyParams&lt;Deps, Context&gt;, PluginExt extends PluginExtension&lt;Extension, DefaultGunshiParams&gt; = PluginExtension&lt; Extension, ResolvedDepExtensions &gt;, MergedExtensions extends GunshiParams = MergedPluginParams&lt; Id, Deps, Context, Awaited&lt;ReturnType&lt;PluginExt&gt;&gt; &gt; &gt;(options: { id: Id name?: string dependencies?: Deps setup?: ( ctx: Readonly&lt; PluginContext&lt;MergedPluginParams&lt;Id, Deps, Context, Awaited&lt;ReturnType&lt;PluginExt&gt;&gt;&gt;&gt; &gt; ) =&gt; Awaitable&lt;void&gt; onExtension?: OnPluginExtension&lt;MergedExtensions&gt; }): PluginWithoutExtension&lt;DefaultGunshiParams[&#39;extensions&#39;]&gt;</code><span class="ox-api-entry__description">Define a plugin without extension and typed dependency extensions</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns PluginWithoutExtension</span><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Define a plugin without extension and typed dependency extensions</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function plugin&lt;&#10;  Context extends ExtendContext = DefaultGunshiParams[&#39;extensions&#39;], // for plugin dependency extensions&#10;  Id extends string = string, // for plugin id&#10;  Deps extends ReadonlyArray&lt;PluginDependency | string&gt; = [], // for plugin dependencies&#10;  Extension extends Record&lt;string, unknown&gt; = &#123;&#125;, // for plugin extension type&#10;  ResolvedDepExtensions extends GunshiParams = DependencyParams&lt;Deps, Context&gt;,&#10;  PluginExt extends PluginExtension&lt;Extension, DefaultGunshiParams&gt; = PluginExtension&lt;&#10;    Extension,&#10;    ResolvedDepExtensions&#10;  &gt;,&#10;  MergedExtensions extends GunshiParams = MergedPluginParams&lt;&#10;    Id,&#10;    Deps,&#10;    Context,&#10;    Awaited&lt;ReturnType&lt;PluginExt&gt;&gt;&#10;  &gt;&#10;&gt;(options: &#123;&#10;  id: Id&#10;  name?: string&#10;  dependencies?: Deps&#10;  setup?: (&#10;    ctx: Readonly&lt;&#10;      PluginContext&lt;MergedPluginParams&lt;Id, Deps, Context, Awaited&lt;ReturnType&lt;PluginExt&gt;&gt;&gt;&gt;&#10;    &gt;&#10;  ) =&gt; Awaitable&lt;void&gt;&#10;  onExtension?: OnPluginExtension&lt;MergedExtensions&gt;&#10;&#125;): PluginWithoutExtension&lt;DefaultGunshiParams[&#39;extensions&#39;]&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L370-L396">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">options</code>
    <code class="ox-api-entry__param-type">{ ... }</code>
  </div>
  <p class="ox-api-entry__param-description">{@linkcode PluginOptions | plugin options} without extension</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">PluginWithoutExtension</code>
  <p class="ox-api-entry__return-description">A defined plugin without extension</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">Context - A type extending {@linkcode ExtendContext} to specify the shape of plugin dependency extensions.</span></li><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="plugin" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">plugin(options: any = {}): any</code><span class="ox-api-entry__description">Define a plugin</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns any</span><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Define a plugin</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function plugin(options: any = &#123;&#125;): any</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L406-L465">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">options</code>
    <code class="ox-api-entry__param-type">any</code>
  </div>
  <p class="ox-api-entry__param-description">{@linkcode PluginOptions | plugin options} — optional · default: {}</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">any</code>
  <p class="ox-api-entry__return-description">A defined plugin</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="plugindependency" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">PluginDependency</code><span class="ox-api-entry__description">Plugin dependency definition</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Plugin dependency definition</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface PluginDependency</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L81-L91">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="pluginextension" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">PluginExtension&lt; T = Record&lt;string, unknown&gt;, G extends GunshiParams = DefaultGunshiParams &gt; = (ctx: CommandContextCore&lt;G&gt;, cmd: Command&lt;G&gt;) =&gt; Awaitable&lt;T&gt;</code><span class="ox-api-entry__description">Plugin extension</span><span class="ox-api-entry__meta"><span class="ox-api-badge">2 params</span><span class="ox-api-badge">returns unknown</span><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Plugin extension</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type PluginExtension&lt;&#10;  T = Record&lt;string, unknown&gt;,&#10;  G extends GunshiParams = DefaultGunshiParams&#10;&gt; = (ctx: CommandContextCore&lt;G&gt;, cmd: Command&lt;G&gt;) =&gt; Awaitable&lt;T&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L116-L119">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ctx</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The {@linkcode CommandContextCore | command context} core</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">cmd</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The {@linkcode Command | command} to which the plugin is being applied</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">An object of type T that represents the extension provided by the plugin</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - The type of the extension object returned by the plugin extension function.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="pluginfunction" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">PluginFunction&lt;G extends GunshiParams = DefaultGunshiParams&gt; = ( ctx: Readonly&lt;PluginContext&lt;G&gt;&gt; ) =&gt; Awaitable&lt;void&gt;</code><span class="ox-api-entry__description">Plugin function type</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Plugin function type</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type PluginFunction&lt;G extends GunshiParams = DefaultGunshiParams&gt; = (&#10;  ctx: Readonly&lt;PluginContext&lt;G&gt;&gt;&#10;) =&gt; Awaitable&lt;void&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L100-L102">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the {@linkcode PluginContext}.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="pluginoptions" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">PluginOptions&lt; DepExt extends ExtendContext = DefaultGunshiParams[&#39;extensions&#39;], // for plugin dependency extensions Id extends string = string, // for plugin id Deps extends ReadonlyArray&lt;PluginDependency | string&gt; = (PluginDependency | string)[], // for plugin dependencies Ext extends Record&lt;string, unknown&gt; = {}, // for plugin extension type ResolvedDepExt extends GunshiParams = DependencyParams&lt;Deps, DepExt&gt;, PluginExt extends PluginExtension&lt;Ext, ResolvedDepExt&gt; = PluginExtension&lt;Ext, ResolvedDepExt&gt;, MergedExt extends GunshiParams = MergedPluginParams&lt; Id, Deps, DepExt, Awaited&lt;ReturnType&lt;PluginExt&gt;&gt; &gt; &gt;</code><span class="ox-api-entry__description">Plugin definition options</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Plugin definition options</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface PluginOptions&lt;&#10;  DepExt extends ExtendContext = DefaultGunshiParams[&#39;extensions&#39;], // for plugin dependency extensions&#10;  Id extends string = string, // for plugin id&#10;  Deps extends ReadonlyArray&lt;PluginDependency | string&gt; = (PluginDependency | string)[], // for plugin dependencies&#10;  Ext extends Record&lt;string, unknown&gt; = &#123;&#125;, // for plugin extension type&#10;  ResolvedDepExt extends GunshiParams = DependencyParams&lt;Deps, DepExt&gt;,&#10;  PluginExt extends PluginExtension&lt;Ext, ResolvedDepExt&gt; = PluginExtension&lt;Ext, ResolvedDepExt&gt;,&#10;  MergedExt extends GunshiParams = MergedPluginParams&lt;&#10;    Id,&#10;    Deps,&#10;    DepExt,&#10;    Awaited&lt;ReturnType&lt;PluginExt&gt;&gt;&#10;  &gt;&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L205-L243">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="pluginwithextension" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">PluginWithExtension&lt; E extends GunshiParams[&#39;extensions&#39;] = DefaultGunshiParams[&#39;extensions&#39;] &gt; extends Plugin&lt;E&gt;</code><span class="ox-api-entry__description">Plugin return type with extension, which includes the plugin ID, name, dependen…</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Plugin return type with extension, which includes the plugin ID, name, dependencies, and extension.</p>
<p>This type is used to define a plugin at <code>plugin</code> function.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface PluginWithExtension&lt;&#10;  E extends GunshiParams[&#39;extensions&#39;] = DefaultGunshiParams[&#39;extensions&#39;]&#10;&gt; extends Plugin&lt;E&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L270-L289">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">E - A type extending {@link GunshiParams} to specify the shape of {@linkcode CommandContext}&#39;s extensions.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="pluginwithoutextension" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">PluginWithoutExtension&lt; E extends GunshiParams[&#39;extensions&#39;] = DefaultGunshiParams[&#39;extensions&#39;] &gt; extends Plugin&lt;E&gt;</code><span class="ox-api-entry__description">Plugin return type without extension, which includes the plugin ID, name, and d…</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Plugin return type without extension, which includes the plugin ID, name, and dependencies, but no extension.</p>
<p>This type is used to define a plugin at <code>plugin</code> function without extension.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface PluginWithoutExtension&lt;&#10;  E extends GunshiParams[&#39;extensions&#39;] = DefaultGunshiParams[&#39;extensions&#39;]&#10;&gt; extends Plugin&lt;E&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L298-L313">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">E - A type extending {@link GunshiParams} to specify the shape of {@linkcode CommandContext}&#39;s extensions.</span></li></ul>
</div>
  </div>
</details>
