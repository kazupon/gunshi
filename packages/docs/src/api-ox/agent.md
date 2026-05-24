# agent.ts

**[Source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/agent.ts)**

> 2 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>2</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>interfaces</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>returns</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>examples</span>
</span>
</div>

## Reference

<div class="ox-api-controls" data-ox-api-target=".ox-api-entry" role="toolbar" aria-label="Reference display controls">
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="expand">Open all</button>
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="collapse">Close all</button>
</div>

<details v-pre id="agentprofile" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">AgentProfile</code><span class="ox-api-entry__description">A profile that summarizes whether the current process is running on an AI codin…</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>A profile that summarizes whether the current process is running on an AI coding agent.</p>
<p>The shape is intentionally minimal so that callers can use it as a UX hint (for example, to switch output format) without coupling to specific agent names. To get the type, use <code>ReturnType&lt;typeof getAgentProfile&gt;</code>.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">interface AgentProfile</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/agent.ts#L30-L46">View source</a></p>
  </div>
</details>

<details v-pre id="getagentprofile" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">getAgentProfile(): AgentProfile</code><span class="ox-api-entry__description">Get the AI coding agent profile of the current process. The detection itself is…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">returns AgentProfile</span><span class="ox-api-badge">1 example</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Get the AI coding agent profile of the current process.</p>
<p>The detection itself is delegated to <code>std-env</code>. This function only converts the upstream <code>agentInfo</code> into Gunshi&#39;s minimal {@link AgentProfile} shape.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function getAgentProfile(): AgentProfile</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/agent.ts#L68-L75">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">AgentProfile</code>
  <p class="ox-api-entry__return-description">An {@link AgentProfile} describing whether the process is running<br>  on an AI coding agent and, if so, which agent was detected.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-js">import &#123; getAgentProfile &#125; from &#39;gunshi/agent&#39;&#10;&#10;const profile = getAgentProfile()&#10;&#10;if (profile.isAgent) &#123;&#10;  // adjust output for AI agent execution&#10;&#125;</code></pre>
</div>
</div>
  </div>
</details>
