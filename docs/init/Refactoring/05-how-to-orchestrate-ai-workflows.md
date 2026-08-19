---
title: How to Orchestrate AI Workflows
author: Luca Rossi
source_url: https://refactoring.fm/p/how-to-orchestrate-ai-workflows
canonical_url: https://refactoring.fm/p/how-to-orchestrate-ai-workflows
site_name: ''
published_at: '2025-04-30T06:01:12.510Z'
modified_at: ''
scraped_at: '2026-05-14T16:28:31Z'
content_hash: cf80571068be75b9f3626242dd8658ac25222af8
markdown_hash: aabe4643ef0bde9209c089fed598148b70252007
ai_summary_short: 'Luca argues that pure AI workflows, while fast to prototype, suffer
  from opacity, silent failures, dirty state, and lack of retries or recovery. He
  advocates for a hybrid approach where deterministic orchestration handles infrastructure
  concerns and AI handles messy judgment tasks. Drawing on Will Larson''s "agents
  as scaffolding" concept, he proposes a four-stage maturity journey: agent-first
  prototyping, isolating deterministic steps into code, structured orchestration with
  proper DAGs and observability, and finally AI-driven composability where LLMs generate
  workflow definitions themselves. He emphasizes that orchestration platforms should
  be code-first, API-first, and open source to enable this future, highlighting Kestra
  as an example that aligns with these principles.'
ai_model: kimi-k2.6
ai_generated_at: '2026-05-14T16:27:48Z'
local_summary_path: pages/p/how-to-orchestrate-ai-workflows-summary.md
original_images_downloaded: false
---

# How to Orchestrate AI Workflows

Article voiceover

0:00

-7:56

Audio playback is not supported on your browser. Please upgrade.

_Hey,[Luca](<https://refactoring.fm/about>) here! Welcome to a _🔒 _**weekly essay** _🔒 _from Refactoring._

_Every week I[write an article](<https://refactoring.fm/s/essays?sort=top>) about how to ship fast and make good software, and [interview a world-class tech leader](<https://refactoring.fm/podcast>). I also build and maintain [Tolaria](<https://refactoring.fm/p/introducing-tolaria>) in the open, publishing my workflows and learnings here._

_Refactoring is read every week by 170,000+ engineers and managers from all over the world_ 🙏🙇‍♂️

* * *

Hey there! Last week’s article about [my workflows for Tolaria](<https://refactoring.fm/p/how-i-run-the-tolaria-project>) went incredibly well, and I got a ton of replies and questions via email.

One of the most recurring ones was: what’s next? How would you improve this?

Happy to answer. I have been building AI workflows for a while now, and, for the most part, I have done so in “100% AI mode” — that is, I tell an agent to do something recurringly, in natural language, and they do it.

These workflows are fast to ship and *mostly* work, but also have pretty obvious drawbacks, that I would love to discuss today.

I believe this is relevant because these days we are inundated by stories like: “n8n is dead!”, “it’s all agents calling agents!”, and so on, while reality is more complicated.

I also bounced a lot of ideas off with the team at [Kestra](<https://kestra.io/>), who runs an awesome open source platform for orchestrating workflows. Their help came at the perfect time, and we basically wrote this piece together.

So here is the agenda:

  * **🧹 Cleaning up releases** — starting from a real-world example.

  * **⚖️ AI vs Orchestration** — mapping pros and cons of how to run workflows.

  * **🏗️ Agents as scaffolding** — a useful mental model about going AI first, but gradually _replacing_ it with code.

  * **🗺️ Workflow engineering journey** — a maturity model for developing your workflows.

Let’s dive in!

* * *

_Disclaimer: I am thankful to[Kestra](<https://kestra.io/>) for partnering on this piece and providing ideas and insights about the orchestration industry. I am a fan of what they build and you should check it out:_

[Learn more about Kestra](<https://kestra.io/>)

 _However, as always I will only write my unbiased opinion on the practices and tools covered, Kestra included._

* * *

To stay grounded and make you understand what I mean when I say _workflows_ , let’s take a practical example. Whenever I create a new stable release for Tolaria, I have an automation to take care of the release’s _aftermath_.

This includes fetching all the bug fixes and feature requests that were _shipped_ in the release, and update/close them in the respective channels, notifying the relevant users.

This is not rocket science by any means, but it involves a number of steps:

  1. Fetch Github commits shipped with release

  2. Match commits to the associated tasks on Todoist

  3. For each task, retrieve the _original_ entry either on Github Issues, or the Canny [product board](<https://tolaria.canny.io/>)

  4. For each Github issue, leave a comment saying this is fixed in the latest release, and close the issue

  5. For each Canny item, leave a comment explaining how this was implemented in the latest release, and close the item

  6. Finally, create short descriptive release notes to be attached to the [release page](<https://refactoringhq.github.io/tolaria/>).

The first version of this was entirely run by AI. No scripts — just a few high-level skills about how to access Github Issues, Canny, and Todoist — and natural language instructions about what needed to happen.

This mostly works. Sure, it is slow and expensive, but that’s forgivable given that I need to run it at most once per day. The problems come when it _doesn’t_ work for any reason.

Say Github issues are not available at that specific time (ofc fantasy example given Github’s [immaculate availability](<https://mrshu.github.io/github-statuses/>) lately), or the run times out, or your favorite AI provider rate limits you in that very moment.

At that point the workflow fails, and it typically does so in the worst possible way: 1) silently, 2) leaving things in a dirty state, and 3) without any retry or recovery.

Of course you may _build_ all of these into the procedure somehow, but if you find yourself manually plumbing standard ideas about how we have been running workflows since... forever, you should probably stop and ask yourself if there is a better way.

So let’s take a step back and think through this from first principles.

* * *

The tradeoffs between pure AI workflows (e.g. cron jobs on OpenClaw) and orchestration platforms a-la Kestra, resemble a lot those between AI and deterministic software.

AI is incredibly smart, but also incredibly expensive and slow. A lot of work just doesn’t need those _smarts_. Routing, retries, conditionals, scheduling — there is just a lot of plumbing that can be done in a purely deterministic way, saving time & money.

Also, traditional orchestration doesn’t only win on time and money: it is often a better choice _full stop_ when you account for:

  * **Observability** — you can’t debug pure LLM reasoning, as you can instead with workflow steps that are explicit and isolated. Also you get execution history, stats, and much more.

  * **Reliability** — scheduling, resiliency, recovery from failures. This should be all built-in.

  * **Scalability** — this is probably not a factor on its own, but more the result of all of the above combined. Being able to scale requires reliability, observability, low latency, and so on.

[![](https://substackcdn.com/image/fetch/$s_!OZfE!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0b240d20-18d6-4292-a2fc-2c43fb8c8e64_2008x1138.png)](<https://substackcdn.com/image/fetch/$s_!OZfE!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0b240d20-18d6-4292-a2fc-2c43fb8c8e64_2008x1138.png>)

So where do we go from here?

* * *

A few weeks ago, Will Larson published an [awesome piece](<https://lethain.com/agents-as-scaffolding/>) about using agents as _scaffolding_ for recurring tasks, which means: a useful _first pass_ to discover what the workflow should be.

Then, once the pattern is known, you should _extract_ and _harden_ as much as you can into deterministic code. So agentic steps are largely used as ‌prototyping tools, not permanent infrastructure.

This doesn’t mean eventually replacing _all_ of the AI, but rather only using AI for the right things. With some degree of simplification:

  * **Orchestration wins at all-things-infra** — observability, reliability, human-in-the-loop approvals, structured output validation, and so on.

  * **AI wins at the** _**messy**_ **stuff** — classification, summarization, judgment calls, and all the things you can’t write code for.

I love this take, and I think we can _expand_ it into an actual maturity journey 👇

* * *

Based on this, a natural progression may look like this:

  1. **Agent-first** — everything in a loop, fast to prototype, but opaque to debug.

  2. **Isolate the deterministic parts** — pull out the boring steps (fetch, validate, store, etc) into explicit code. Keep AI for judgment calls.

  3. **Structured orchestration** — proper DAG / event-driven layer with retries, lineage, observability. AI becomes one task type among many.

  4. **AI-driven composability** — LLMs generate or modify the workflow definitions themselves. The orchestration layer is stable enough to be a target for code generation.

I am particularly bullish about #4 because, when you think about it, it is a way to get the best of both worlds: you prompt the AI in natural language as you would for normal agentic workflows, but the AI actually turns that into structured, semi-deterministic work.

[![](https://substackcdn.com/image/fetch/$s_!Ppb9!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe8c546d1-241f-4e91-9df0-9faa549aaff4_1854x542.png)](<https://substackcdn.com/image/fetch/$s_!Ppb9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe8c546d1-241f-4e91-9df0-9faa549aaff4_1854x542.png>)

A quick plug to [Kestra](<https://kestra.io/>) on this, which I am a big fan of. Because if you _agree_ with these steps, a natural question becomes: what should an orchestration platform look like to enable AI to operate it? Kestra checks a lot of my boxes:

  * **Code-first** — the AI should be able to write workflows in a declarative fashion, with code, because that’s what it’s best at (as opposed to e.g. GUIs).

  * **API/CLI first** — trigger executions and manage workflows through API

  * **Open source** — these days, considering the speed tech is moving at, I put a lot of value on the tools I use being open source, so we can evolve them faster as a community, in the open, and there is less lock-in.

* * *

And that’s it for today! I wish you a great week

Sincerely 👋  
Luca

[![João's avatar](https://substackcdn.com/image/fetch/$s_!gSNg!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fab32bf26-9e68-4431-822a-6efb251c3b23_144x144.png)](<https://substack.com/profile/2365467-joao>)[![Scott Sterling's avatar](https://substackcdn.com/image/fetch/$s_!xD-I!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F29ae6bde-8673-4137-a0c3-ae1b8e8847b5_1024x1024.webp)](<https://substack.com/profile/232392321-scott-sterling>)[![Manik's avatar](https://substackcdn.com/image/fetch/$s_!3WBc!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74a10d8b-1420-4233-9192-11619bdd0d87_144x144.png)](<https://substack.com/profile/280077696-manik>)[![sanjay's avatar](https://substackcdn.com/image/fetch/$s_!JbK2!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16ecccd4-554c-46e7-aa5b-eed1ba546748_144x144.png)](<https://substack.com/profile/26755063-sanjay>)[![Maurice Klimek's avatar](https://substackcdn.com/image/fetch/$s_!H6U_!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F963828a9-eed9-4f5d-a9ab-603b665d4700_400x400.jpeg)](<https://substack.com/profile/10432226-maurice-klimek>)

42 Likes

[](<https://substack.com/note/p-197106828/restacks?utm_source=substack&utm_content=facepile-restacks>)
