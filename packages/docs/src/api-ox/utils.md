# utils.ts

**[Source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/utils.ts)**

> 6 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>6</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>6</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>9</strong>
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

<details v-pre id="create" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">create&lt;T&gt;(obj: object | null = null): T</code><span class="ox-api-entry__description">Create an object with the specified prototype. A shorthand for <code>Object.create</code>.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns T</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Create an object with the specified prototype. A shorthand for <code>Object.create</code>.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function create&lt;T&gt;(obj: object | null = null): T</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/utils.ts#L97-L99">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">obj</code>
    <code class="ox-api-entry__param-type">object | null</code>
  </div>
  <p class="ox-api-entry__param-description">An object to use as the prototype for the new object. If <code>null</code>, it will create an object with no prototype. — optional · default: null</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">T</code>
  <p class="ox-api-entry__return-description">A new object with the specified prototype</p>
</div>
</div>
  </div>
</details>

<details v-pre id="deepfreeze" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">deepFreeze&lt;T extends Record&lt;string, any&gt;&gt;(obj: T, ignores: string[] = []): Readonly&lt;T&gt;</code><span class="ox-api-entry__description">Deep freeze an object, making it immutable.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">2 params</span><span class="ox-api-badge">returns Readonly</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Deep freeze an object, making it immutable.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function deepFreeze&lt;T extends Record&lt;string, any&gt;&gt;(obj: T, ignores: string[] = []): Readonly&lt;T&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/utils.ts#L157-L176">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">obj</code>
    <code class="ox-api-entry__param-type">T</code>
  </div>
  <p class="ox-api-entry__param-description">The object to freeze</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ignores</code>
    <code class="ox-api-entry__param-type">string[]</code>
  </div>
  <p class="ox-api-entry__param-description">Properties to ignore during freezing — optional · default: []</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Readonly</code>
  <p class="ox-api-entry__return-description">A frozen object</p>
</div>
</div>
  </div>
</details>

<details v-pre id="getcommandsubcommands" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">getCommandSubCommands&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(cmd: Commandable&lt;G&gt; | Command&lt;G&gt; | LazyCommand&lt;G&gt;): Map&lt;string, Command&lt;G&gt; | LazyCommand&lt;G&gt;&gt; | undefined</code><span class="ox-api-entry__description">Get the sub-commands of a command as a normalized Map.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns Map | undefined</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Get the sub-commands of a command as a normalized Map.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function getCommandSubCommands&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(cmd: Commandable&lt;G&gt; | Command&lt;G&gt; | LazyCommand&lt;G&gt;): Map&lt;string, Command&lt;G&gt; | LazyCommand&lt;G&gt;&gt; | undefined</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/utils.ts#L116-L148">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">cmd</code>
    <code class="ox-api-entry__param-type">Commandable | Command | LazyCommand</code>
  </div>
  <p class="ox-api-entry__param-description">A command or lazy command</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Map | undefined</code>
  <p class="ox-api-entry__return-description">A Map of sub-commands, or undefined if the command has no sub-commands.</p>
</div>
</div>
  </div>
</details>

<details v-pre id="islazycommand" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">isLazyCommand&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(cmd: unknown): cmd is LazyCommand&lt;G&gt;</code><span class="ox-api-entry__description">Check if the given command is a {@link LazyCommand}.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns unknown</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Check if the given command is a {@link LazyCommand}.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function isLazyCommand&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(cmd: unknown): cmd is LazyCommand&lt;G&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/utils.ts#L22-L26">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">cmd</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">A command to check</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description"><code>true</code> if the command is a {@link LazyCommand}, otherwise `false</p>
</div>
</div>
  </div>
</details>

<details v-pre id="log" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">log(...args: unknown[]): void</code><span class="ox-api-entry__description">Log a message to the console.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns void</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Log a message to the console.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function log(...args: unknown[]): void</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/utils.ts#L106-L108">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">args</code>
    <code class="ox-api-entry__param-type">unknown[]</code>
  </div>
  <p class="ox-api-entry__param-description">Arguments to log</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">void</code>
  
</div>
</div>
  </div>
</details>

<details v-pre id="resolvelazycommand" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">resolveLazyCommand&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(cmd: Commandable&lt;G&gt;, name?: string, needRunResolving: boolean = false): Promise&lt;Command&lt;G&gt;&gt;</code><span class="ox-api-entry__description">Resolve a lazy command to a {@link Command}.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">3 params</span><span class="ox-api-badge">returns Promise</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Resolve a lazy command to a {@link Command}.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function resolveLazyCommand&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(cmd: Commandable&lt;G&gt;, name?: string, needRunResolving: boolean = false): Promise&lt;Command&lt;G&gt;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/utils.ts#L36-L89">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">cmd</code>
    <code class="ox-api-entry__param-type">Commandable</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link Commandable} or {@link LazyCommand} to resolve</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">name</code>
    <code class="ox-api-entry__param-type">string</code>
  </div>
  <p class="ox-api-entry__param-description">Optional name of the command, if not provided, it will use the name from the command itself. — optional</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">needRunResolving</code>
    <code class="ox-api-entry__param-type">boolean</code>
  </div>
  <p class="ox-api-entry__param-description">Whether to run the resolving function of the lazy command. — optional · default: false</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Promise</code>
  <p class="ox-api-entry__return-description">A resolved {@link Command}</p>
</div>
</div>
  </div>
</details>
