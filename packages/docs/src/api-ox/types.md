# types.ts

**[Source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts)**

> 28 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>28</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>8</strong>
  <span>interfaces</span>
</span>
<span class="ox-api-stat">
  <strong>20</strong>
  <span>types</span>
</span>
<span class="ox-api-stat">
  <strong>8</strong>
  <span>parameters</span>
</span>
<span class="ox-api-stat">
  <strong>6</strong>
  <span>returns</span>
</span>
</div>

## Reference

<div class="ox-api-controls" data-ox-api-target=".ox-api-entry" role="toolbar" aria-label="Reference display controls">
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="expand">Open all</button>
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="collapse">Close all</button>
</div>

<details v-pre id="awaitable" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">Awaitable&lt;T&gt; = T | Promise&lt;T&gt;</code><span class="ox-api-entry__description">Awaitable type.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Awaitable type.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type Awaitable&lt;T&gt; = T | Promise&lt;T&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L16">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - The type of the value that can be awaited.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="clioptions" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CliOptions&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code><span class="ox-api-entry__description">CLI options of {@linkcode cli} function.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>CLI options of {@linkcode cli} function.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface CliOptions&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L269-L361">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of cli options.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="command" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">Command&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code><span class="ox-api-entry__description">Command interface.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Command interface.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface Command&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L553-L613">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - The Gunshi parameters constraint</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="commandable" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">Commandable&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = | Command&lt;G&gt; | LazyCommand&lt;G, {}&gt;</code><span class="ox-api-entry__description">Define a command type.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Define a command type.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type Commandable&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = | Command&lt;G&gt;&#10;  | LazyCommand&lt;G, &#123;&#125;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L644-L646">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="commandcallmode" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CommandCallMode = &#39;entry&#39; | &#39;subCommand&#39; | &#39;unexpected&#39;</code><span class="ox-api-entry__description">Command call mode. - <code>entry</code>: The command is executed as an entry command. - `s…</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Command call mode.</p>
<ul>
<li><code>entry</code>: The command is executed as an entry command.</li>
<li><code>subCommand</code>: The command is executed as a sub-command.</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type CommandCallMode = &#39;entry&#39; | &#39;subCommand&#39; | &#39;unexpected&#39;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L369">View source</a></p>
  </div>
</details>

<details v-pre id="commandcontext" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CommandContext&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code><span class="ox-api-entry__description">Command context. Command context is the context of the command execution.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Command context.</p>
<p>Command context is the context of the command execution.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface CommandContext&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L378-L476">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command context.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="commandcontextcore" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CommandContextCore&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = Readonly&lt; CommandContext&lt;G&gt; &gt;</code><span class="ox-api-entry__description">Readonly command context available to a command context extension factory.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Readonly command context available to a command context extension factory.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type CommandContextCore&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = Readonly&lt;&#10;  CommandContext&lt;G&gt;&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L485-L487">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command context.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="commandcontextextension" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CommandContextExtension&lt; E extends GunshiParams[&#39;extensions&#39;] = DefaultGunshiParams[&#39;extensions&#39;] &gt;</code><span class="ox-api-entry__description">Command context extension</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Command context extension</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface CommandContextExtension&lt;&#10;  E extends GunshiParams[&#39;extensions&#39;] = DefaultGunshiParams[&#39;extensions&#39;]&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L496-L511">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">E - A type extending {@linkcode GunshiParams.extensions} to specify the shape of the extension.</span></li><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="commanddecorator" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CommandDecorator&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = ( baseRunner: (ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;) =&gt; Awaitable&lt;string | void&gt; ) =&gt; (ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;) =&gt; Awaitable&lt;string | void&gt;</code><span class="ox-api-entry__description">Command decorator. A function that wraps a command runner to add or modify its…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns unknown</span><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Command decorator.</p>
<p>A function that wraps a command runner to add or modify its behavior.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type CommandDecorator&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = (&#10;  baseRunner: (ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;) =&gt; Awaitable&lt;string | void&gt;&#10;) =&gt; (ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;) =&gt; Awaitable&lt;string | void&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L760-L762">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">baseRunner</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The base command runner to decorate</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">The decorated command runner</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command context.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="commandenvironment" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CommandEnvironment&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code><span class="ox-api-entry__description">Command environment.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Command environment.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface CommandEnvironment&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L158-L262">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command environments.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="commandexamplesfetcher" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CommandExamplesFetcher&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = ( ctx: Readonly&lt;CommandContext&lt;G&gt;&gt; ) =&gt; Awaitable&lt;string&gt;</code><span class="ox-api-entry__description">Command examples fetcher.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns unknown</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Command examples fetcher.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type CommandExamplesFetcher&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = (&#10;  ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;&#10;) =&gt; Awaitable&lt;string&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L718-L720">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ctx</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link CommandContext | command context}</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">A fetched command examples.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command context.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="commandloader" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CommandLoader&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = () =&gt; Awaitable&lt; Command&lt;G&gt; | CommandRunner&lt;G&gt; &gt;</code><span class="ox-api-entry__description">Command loader. A function that returns a command or command runner. This is us…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">returns unknown</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Command loader.</p>
<p>A function that returns a command or command runner. This is used to lazily load commands.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type CommandLoader&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = () =&gt; Awaitable&lt;&#10;  Command&lt;G&gt; | CommandRunner&lt;G&gt;&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L744-L746">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">A command or command runner</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command context and command runner.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="commandrunner" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">CommandRunner&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = ( ctx: Readonly&lt;CommandContext&lt;G&gt;&gt; ) =&gt; Awaitable&lt;string | void&gt;</code><span class="ox-api-entry__description">Command runner.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns unknown</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Command runner.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type CommandRunner&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = (&#10;  ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;&#10;) =&gt; Awaitable&lt;string | void&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L730-L732">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ctx</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link CommandContext | command context}</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">void or string (for CLI output)</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command context.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="defaultgunshiparams" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">DefaultGunshiParams = GunshiParams</code><span class="ox-api-entry__description">Default Gunshi parameters.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Default Gunshi parameters.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type DefaultGunshiParams = GunshiParams</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L67">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="extendcontext" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">ExtendContext = Record&lt;string, unknown&gt;</code><span class="ox-api-entry__description">Extend command context type. This type is used to extend the command context wi…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Extend command context type. This type is used to extend the command context with additional properties at {@linkcode CommandContext.extensions}.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type ExtendContext = Record&lt;string, unknown&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L30">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="extractargexplicitlyprovided" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">ExtractArgExplicitlyProvided&lt;G&gt; = ArgExplicitlyProvided&lt;ExtractArgs&lt;G&gt;&gt;</code><span class="ox-api-entry__description">Type helper to extract explicitly provided argument flags.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Type helper to extract explicitly provided argument flags.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type ExtractArgExplicitlyProvided&lt;G&gt; = ArgExplicitlyProvided&lt;ExtractArgs&lt;G&gt;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L108">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - The type of {@linkcode GunshiParams}.</span></li><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="extractargs" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">ExtractArgs&lt;G&gt; = G extends GunshiParams&lt;any&gt; ? G[&#39;args&#39;] : G extends { args: infer A extends Args } ? A : Args</code><span class="ox-api-entry__description">Type helper to extract args</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Type helper to extract args</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type ExtractArgs&lt;G&gt; = G extends GunshiParams&lt;any&gt;&#10;    ? G[&#39;args&#39;]&#10;    : G extends &#123;&#10;          args: infer A extends Args&#10;        &#125;&#10;      ? A&#10;      : Args</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L92-L99">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - The type of {@linkcode GunshiParams} or an object with {@linkcode Args}.</span></li><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="extractextensions" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">ExtractExtensions&lt;G&gt; = G extends GunshiParams&lt;any&gt; ? G[&#39;extensions&#39;] : G extends { extensions: infer E } ? E : {}</code><span class="ox-api-entry__description">Type helper to extract extensions from G</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Type helper to extract extensions from G</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type ExtractExtensions&lt;G&gt; = G extends GunshiParams&lt;any&gt; ? G[&#39;extensions&#39;] : G extends &#123; extensions: infer E &#125; ? E : &#123;&#125;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L115-L116">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="gunshiparams" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">GunshiParams&lt; P extends { args?: Args extensions?: ExtendContext } = { args: Args extensions: {} } &gt;</code><span class="ox-api-entry__description">Gunshi unified parameter type. This type combines both argument definitions and…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Gunshi unified parameter type.</p>
<p>This type combines both argument definitions and command context extensions.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface GunshiParams&lt;&#10;  P extends &#123;&#10;    args?: Args&#10;    extensions?: ExtendContext&#10;  &#125; = &#123;&#10;    args: Args&#10;    extensions: &#123;&#125;&#10;  &#125;&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L42-L59">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">P - The type of parameters, which can include <code>args</code> and <code>extensions</code>.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="gunshiparamsconstraint" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">GunshiParamsConstraint = | GunshiParams&lt;any&gt; | { args: Args } | { extensions: ExtendContext }</code><span class="ox-api-entry__description">Generic constraint for command-related types. This type constraint allows both…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Generic constraint for command-related types.</p>
<p>This type constraint allows both {@linkcode GunshiParams} and objects with extensions.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type GunshiParamsConstraint = | GunshiParams&lt;any&gt;&#10;  | &#123;&#10;      args: Args&#10;    &#125;&#10;  | &#123;&#10;      extensions: ExtendContext&#10;    &#125;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L76-L83">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="lazycommand" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">LazyCommand&lt; G extends GunshiParamsConstraint = DefaultGunshiParams, D extends Partial&lt;Command&lt;G&gt;&gt; = {} &gt; = { /** * Command load function */ (): Awaitable&lt;Command&lt;G&gt; | CommandRunner&lt;G&gt;&gt; } &amp; // If definition has name, commandName is required with that type (D extends { name: infer N } ? { commandName: N } : { commandName?: string }) &amp; // Properties from the definition (if provided inline) Omit&lt;D, &#39;name&#39; | &#39;run&#39;&gt; &amp; // Remaining properties from Command (optional) Partial&lt;Omit&lt;Command&lt;G&gt;, keyof D | &#39;run&#39; | &#39;name&#39;&gt;&gt;</code><span class="ox-api-entry__description">Lazy command interface. Lazy command that&#39;s not loaded until it is executed.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Lazy command interface.</p>
<p>Lazy command that&#39;s not loaded until it is executed.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type LazyCommand&lt;&#10;  G extends GunshiParamsConstraint = DefaultGunshiParams,&#10;  D extends Partial&lt;Command&lt;G&gt;&gt; = &#123;&#125;&#10;&gt; = &#123;&#10;  /**&#10;   * Command load function&#10;   */&#10;  (): Awaitable&lt;Command&lt;G&gt; | CommandRunner&lt;G&gt;&gt;&#10;&#125; &amp;&#10;  // If definition has name, commandName is required with that type&#10;  (D extends &#123; name: infer N &#125; ? &#123; commandName: N &#125; : &#123; commandName?: string &#125;) &amp;&#10;  // Properties from the definition (if provided inline)&#10;  Omit&lt;D, &#39;name&#39; | &#39;run&#39;&gt; &amp;&#10;  // Remaining properties from Command (optional)&#10;  Partial&lt;Omit&lt;Command&lt;G&gt;, keyof D | &#39;run&#39; | &#39;name&#39;&gt;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L623-L637">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - The Gunshi parameters constraint</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="mergegunshiextensions" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">MergeGunshiExtensions&lt; G extends GunshiParamsConstraint, E extends ExtendContext &gt; = GunshiParams&lt;{ /** * Command argument definitions. */ args: ExtractArgs&lt;G&gt; /** * Merged command context extensions. */ extensions: ExtractExtensions&lt;G&gt; &amp; E }&gt;</code><span class="ox-api-entry__description">Type helper to merge command context extensions into G</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Type helper to merge command context extensions into G</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type MergeGunshiExtensions&lt;&#10;  G extends GunshiParamsConstraint,&#10;  E extends ExtendContext&#10;&gt; = GunshiParams&lt;&#123;&#10;  /**&#10;   * Command argument definitions.&#10;   */&#10;  args: ExtractArgs&lt;G&gt;&#10;  /**&#10;   * Merged command context extensions.&#10;   */&#10;  extensions: ExtractExtensions&lt;G&gt; &amp; E&#10;&#125;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L139-L151">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="normalizetogunshiparams" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">NormalizeToGunshiParams&lt;G&gt; = G extends GunshiParams&lt;any&gt; ? G : G extends { args: infer A extends Args; extensions: infer E extends ExtendContext } ? GunshiParams&lt;{ args: A; extensions: E }&gt; : G extends { args: infer A extends Args } ? GunshiParams&lt;{ args: A; extensions: {} }&gt; : G extends { extensions: infer E extends ExtendContext } ? GunshiParams&lt;{ args: Args; extensions: E }&gt; : DefaultGunshiParams</code><span class="ox-api-entry__description">Type helper to normalize G to GunshiParams</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Type helper to normalize G to GunshiParams</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type NormalizeToGunshiParams&lt;G&gt; = G extends GunshiParams&lt;any&gt;&#10;    ? G&#10;    : G extends &#123; args: infer A extends Args; extensions: infer E extends ExtendContext &#125;&#10;      ? GunshiParams&lt;&#123; args: A; extensions: E &#125;&gt;&#10;      : G extends &#123; args: infer A extends Args &#125;&#10;        ? GunshiParams&lt;&#123; args: A; extensions: &#123;&#125; &#125;&gt;&#10;        : G extends &#123; extensions: infer E extends ExtendContext &#125;&#10;          ? GunshiParams&lt;&#123; args: Args; extensions: E &#125;&gt;&#10;          : DefaultGunshiParams</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L123-L132">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>

<details v-pre id="prettify" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">Prettify&lt;T&gt; = { [K in keyof T]: T[K] } &amp; {}</code><span class="ox-api-entry__description">Prettify a type by flattening its structure.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Prettify a type by flattening its structure.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type Prettify&lt;T&gt; = &#123; [K in keyof T]: T[K] &#125; &amp; &#123;&#125;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L23">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - The type to be prettified.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="rendererdecorator" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">RendererDecorator&lt;T, G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = ( baseRenderer: (ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;) =&gt; Promise&lt;T&gt;, ctx: Readonly&lt;CommandContext&lt;G&gt;&gt; ) =&gt; Promise&lt;T&gt;</code><span class="ox-api-entry__description">Renderer decorator type. A function that wraps a base renderer to add or modify…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">2 params</span><span class="ox-api-badge">returns unknown</span><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Renderer decorator type.</p>
<p>A function that wraps a base renderer to add or modify its behavior.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type RendererDecorator&lt;T, G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = (&#10;  baseRenderer: (ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;) =&gt; Promise&lt;T&gt;,&#10;  ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;&#10;) =&gt; Promise&lt;T&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L778-L781">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">baseRenderer</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The base renderer function to decorate</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ctx</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The command context</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">The decorated result</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - The type of the rendered result.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="renderingoptions" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">RenderingOptions&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code><span class="ox-api-entry__description">Rendering control options</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Rendering control options</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface RenderingOptions&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L520-L546">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of render options.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="subcommandable" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">SubCommandable</code><span class="ox-api-entry__description">Sub-command entry type for use in subCommands. This type uses a loose structura…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.1</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Sub-command entry type for use in subCommands.</p>
<p>This type uses a loose structural match to bypass TypeScript&#39;s contravariance issues with function parameters, allowing any Command or LazyCommand to be used as a sub-command.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface SubCommandable</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L656-L708">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.1</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="validationerrorsdecorator" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">ValidationErrorsDecorator&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = ( baseRenderer: (ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;, error: AggregateError) =&gt; Promise&lt;string&gt;, ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;, error: AggregateError ) =&gt; Promise&lt;string&gt;</code><span class="ox-api-entry__description">Validation errors renderer decorator type. A function that wraps a validation e…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">3 params</span><span class="ox-api-badge">returns unknown</span><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Validation errors renderer decorator type. A function that wraps a validation errors renderer to add or modify its behavior.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type ValidationErrorsDecorator&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = (&#10;  baseRenderer: (ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;, error: AggregateError) =&gt; Promise&lt;string&gt;,&#10;  ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;,&#10;  error: AggregateError&#10;) =&gt; Promise&lt;string&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L796-L800">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">baseRenderer</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The base validation errors renderer function to decorate</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ctx</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The command context</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">error</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The aggregate error containing validation errors</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">The decorated result</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command context.</span></li></ul>
</div>
  </div>
</details>
