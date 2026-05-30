# getAgentProfile

<div id="getagentprofile" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Get the AI coding agent profile of the current process.</p>
<p>The detection itself is delegated to <code>std-env</code>. This function only converts the upstream <code>agentInfo</code> into Gunshi&#39;s minimal AgentProfile shape.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function getAgentProfile(): AgentProfile</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/agent.ts#L68-L75" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">AgentProfile</code>
  <p class="ox-api-entry__return-description">An AgentProfile describing whether the process is running<br>  on an AI coding agent and, if so, which agent was detected.</p>
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
