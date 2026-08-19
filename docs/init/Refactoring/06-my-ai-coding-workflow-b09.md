---
title: My AI Coding Workflow
author: Luca Rossi
source_url: https://refactoring.fm/p/my-ai-coding-workflow-b09
canonical_url: https://refactoring.fm/p/my-ai-coding-workflow-b09
site_name: ''
published_at: '2025-04-30T06:01:12.510Z'
modified_at: '2026-06-03T07:02:23.954Z'
scraped_at: '2026-06-15T09:58:56Z'
content_hash: aa8f0193aedcdcd2ebf49706ee6c0108be51e4e6
markdown_hash: 5850e7efae67a061e8b95f6fab937f1cfd0f13ba
ai_summary_short: 'Luca Rossi details his evolved AI coding workflow for Tolaria,
  a project he maintains with ~28 commits/day on ~2 hours of daily work, achieving
  99.1% crash-free rate and 1-day average bug fix time across 150K LOC plus 100K LOC
  of tests. He structures AI inputs through a three-layer mental model: Guides (rules
  in AGENTS.md covering TDD, boy scout rule, shadcn/ui, Lara CLI localization, PostHog
  instrumentation, security via Codacy MCP, manual QA through computer use, and docs
  maintenance), Gates (blocking local hooks via Husky enforcing 10/10 CodeScene health,
  0 Codacy issues, and 85%+ test coverage), and Guards (nightly OpenClaw-run procedures
  for refactoring, performance, localization, docs, and testing pipeline health).
  He switched from Claude Code to Codex with GPT-5.4/5.'
ai_model: kimi-k2.6
ai_generated_at: '2026-06-15T09:57:52Z'
local_summary_path: pages/p/my-ai-coding-workflow-b09-summary.md
original_images_downloaded: false
---

# My AI Coding Workflow

Article voiceover

0:00

-13:45

Audio playback is not supported on your browser. Please upgrade.

_Hey,[Luca](<https://refactoring.fm/about>) here! Welcome to a _🔒 _**weekly essay** _🔒 _from Refactoring._

_Every week I[write an article](<https://refactoring.fm/s/essays?sort=top>) about how to ship fast and make good software, and [interview a world-class tech leader](<https://refactoring.fm/podcast>). I also build and maintain [Tolaria](<https://refactoring.fm/p/introducing-tolaria>) in the open, publishing my workflows and learnings here._

_Refactoring is read every week by 170,000+ engineers and managers from all over the world_!

* * *

Hey! When I launched [Tolaria](<http://tolaria.md/>) I promised I would publish ~monthly updates to my AI coding workflow. The last one was in April, so I am late!

In May I also published [how I run Tolaria](<https://refactoring.fm/p/how-i-run-the-tolaria-project>) as a project, but this was more about general _orchestration_ , so I wanted to post an update that is more **specific to coding**.

I will start by saying that things are going... well.

Tolaria by now has a few thousands daily users, most whom are engineers. These are quite eager to report bugs, submit PRs, and suggest improvements on social media, Github discussions, email, and more — so keeping up with everything is quite a lot of work.

Still, I am happy with where we stand. As I write these, we got:

  * **6 open issues** — vs 417 closed.

  * **14 open PRs** — vs 306 closed.

  * **1 day** — average bug fix time.

  * **99.1% crash-free rate** — as measured by Sentry.

  * **~28 commits / day** — on average.

  * **2 hours a day** — I work on Tolaria, give or take.

I released Tolaria on April 22nd, so all of this happened in little more than a month, which is crazy when you think about it. From the day of the release, I added about ~1000 commits, and the codebase has grown a bit, but not massively: right now it’s 150K LOC, plus ~100K LOC of tests.

Most importantly, I don’t feel my velocity has decreased.

If anything, I am probably producing _more_ output per unit of input than two months ago, so the _effectiveness_ feels higher. Code quality also is higher, we are not drowning in regressions, and the rate at which bugs are reported feels stable.

So today I will cover the tweaks I made to my AI coding over the last ~2 months. To catch up with the full process, you can also go back to the previous articles here:

[![My AI Coding Workflow](https://substackcdn.com/image/fetch/$s_!q8uO!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3b48c3e1-3c66-4975-8ec5-44d399f73dc2_2238x1490.png)My AI Coding Workflow[Luca Rossi](<https://substack.com/profile/6835984-luca-rossi>)·Feb 25[Read full story](<https://refactoring.fm/p/my-ai-coding-workflow>)](<https://refactoring.fm/p/my-ai-coding-workflow>)

[![Updates to my AI Coding Workflow](https://substackcdn.com/image/fetch/$s_!9oxY!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7c31c0da-a80c-463b-8804-c108402a8d19_1200x800.png)Updates to my AI Coding Workflow[Luca Rossi](<https://substack.com/profile/6835984-luca-rossi>)·Apr 8[Read full story](<https://refactoring.fm/p/updates-to-my-ai-coding-workflow>)](<https://refactoring.fm/p/updates-to-my-ai-coding-workflow>)

Here is the agenda for today:

  1. 🚥 **Guides, Gates, and Guards** — my mental model for the various types of AI instructions. The core of the article.

  2. 🤖 **From Claude to Codex** — I moved to Codex and (for now) I am not going back.

  3. 💸 **How much I am spending** — monthly cost is now down >90%

  4. 🔭 **What’s next / missing** — what I am trying to improve right now

Let’s dive in!

* * *

When it comes to the dev process, I think about the types of _inputs_ that I can give to AI in three steps:

  1. ↪️ **Guides** — rules and explainers of how to do things.

  2. 🔄 **Gates** — deterministic checks that _block_ bad things and force the AI to steer its output.

  3. ↩️ **Guards** — _fallback_ procedures to improve what falls through the cracks.

These steps are also somewhat sequential:

  * Guides are the basic context that the AI uses to start the work

  * Gates get into play to steer the work while it’s in progress

  * Guards are the last line of defense against enshittification.

Let’s look at all of them:

[![](https://substackcdn.com/image/fetch/$s_!JuRD!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F79146243-97aa-45f3-b970-6a58364edeb2_1708x820.png)](<https://substackcdn.com/image/fetch/$s_!JuRD!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F79146243-97aa-45f3-b970-6a58364edeb2_1708x820.png>)

We can as well call them _rules_ , but then we’d lose the 3G’s memorability!

These days you write guides for AI agents in two main ways:

  * **AGENTS.md / CLAUDE.md** — the core instructions that the agent _always_ loads.

  * **Skills** — specific instructions to do particular tasks. A skill gets _used_ only when the task requires it.

It’s worth noting that the _boundaries_ between the two surfaces are not very clear. It’s often dubious whether you should create a separate skill or just slam everything into the AGENTS.md, and even benchmarks are inconclusive about the effectiveness of the various strategies.

I believe that’s because, at their core, they are the same thing: **instructions** to the agent.

My dev process is simple enough that I can afford to keep everything into the AGENTS.md, and not use any specific skill. I have tried a few and never felt things got noticeably better, so I opted for keeping things simple.

You can inspect the actual [file](<https://github.com/refactoringhq/tolaria/blob/main/AGENTS.md>) — it’s not perfect, mind you, but gives you a more precise idea.

In my AGENTS.md, the most important instructions are about:

  * **TDD** — the agents has to write tests first and do the classic red → green → refactor.

  * **Boy scout rule** — leave the code in a better shape than you found it. It should also measure the before/after quantitatively with CodeScene and Codacy.

  * **UI** — always use shadcn/ui components when possible, and inspect our design language before implementing new UI (we got basic tokens for colors, typography, spacing, etc).

  * **Localization** — extract and translate all the new strings in the supported languages. I use the [Lara](<https://laratranslate.com/about-lara?utm_term=lara%20translate&utm_campaign=LARA+SEM+-+Brand&utm_source=adwords&utm_medium=ppc&hsa_acc=4328324064&hsa_cam=21903987592&hsa_grp=170296292597&hsa_ad=720960573760&hsa_src=g&hsa_tgt=kwd-2376217352548&hsa_kw=lara%20translate&hsa_mt=e&hsa_net=adwords&hsa_ver=3&gad_source=1&gad_campaignid=21903987592&gbraid=0AAAAAohNJ6REfuYwwEVIav_w_li-_XboQ&gclid=Cj0KCQjw2_TQBhCnARIsAF3-XhyyKQUq2sjYWJ6YdEl9XlOnk4BVQxxvTD-setBqq7cYgE_-emZFfxIaAl93EALw_wcB>) CLI for this.

  * **Product analytics** — _instrument_ new features with PostHog events.

  * **Security** — write code that is safe and robust. This is partly informed by the Codacy MCP.

  * **Manual QA** — other than writing tests, test the app as a user would, clicking around and using mouse and keyboard. Computer use is great for this.

  * **Docs** — check existing docs ([ADRs](<https://github.com/refactoringhq/tolaria/tree/main/docs/adr>), [ARCHITECTURE.md](<https://github.com/refactoringhq/tolaria/blob/main/docs/ARCHITECTURE.md>), [ABSTRACTIONS.md](<https://github.com/refactoringhq/tolaria/blob/main/docs/ABSTRACTIONS.md>)) before doing new work, write new ADRs when needed, supersede obsolete ones, and possibly update the overview docs.

All in all, this is not a lot of stuff. The file is <200 lines, and I have a weekly procedure to keep it lean.

Still, every now and then agents simply _ignore_ instructions _—_ so it doesn’t matter how good, clean, and short your rules are: they are not enough to prevent drift.

Enter gates 👇

You may have noticed some of the rules above are enabled or helped by external _sensors_. I borrow this word from [this great article](<https://martinfowler.com/articles/sensors-for-coding-agents.html>) by Birgitta Bockeler (who I also interviewed [on the podcast](<https://refactoring.fm/p/navigating-ai-development-workflows>)).

**Sensors** are devices that allow the agent to measure how it is doing on some particular aspects. I employ a few:

  * **[CodeScene](<https://codescene.com/>)** — to measure code health of individual files, correlated with how often they are changed (high-churn files should be higher quality).

  * **[Codacy](<https://codacy.com/>)** — to intercept security issues and other code smells.

  * **v8 code coverage + llvm-cov** — to measure test coverage for Typescript and Rust.

Sensors are useful to embed in the dev process, but if left as recommendations in rules, they sometimes get ignored by agents, just like everything else.

So the best use of sensors is to create **gates**. Gates are blocking checks that _prevent_ the code from being shipped if it doesn’t match some (deterministic) conditions.

The traditional way of setting these is in the CI, but I use local hooks instead (with [Husky](<https://typicode.github.io/husky/>)) because it’s faster and creates a better feedback loop with the agent. The drawback of local hooks is that they completely hog my machine, so I am testing [various ways](<https://circleci.com/blog/chunk-sidecars/>) to do the same kind of quick validation, but in a hosted way.

As of today, new code needs to pass the following gates:

  * 10/10 code health on CodeScene

  * 0 issues on Codacy

  * 85%+ test coverage

The third way I avoid _drift_ in the codebase is by employing Guards, which I also discussed [in our latest AI Club](<https://refactoring.fm/p/insights-from-our-first-ai-club>).

Sensors and gates are great, but they fall _short_ of all the things that can go wrong, in two ways:

  * **Judgment calls** — for some things there is simply no way to build a deterministic check. Does this change need an ADR? Are there new strings to be localized? Does this feature deserve a PostHog event?

  * **Big picture** **thinking** — a single change can be perfectly fine in isolation, but sneakily create problems over the long run. E.g. duplication, performance drift, test suite getting too slow, and so on.

For this stuff, I run specialized procedures, typically once a day, that _guard_ against these bad outcomes.

As of today, here are the _guards_ I run nightly:

  * **Refactoring Guard** — it looks for broader opportunities to improve architecture.

  * **Performance Guard** — it looks for ways to make the app faster (as measured by probes in the code) and prevents that new things make it slower.

  * **Localization Guard** — it looks for strings that should have been translated but they have not.

  * **Docs Guard** — it looks for changes that required ADRs and retrofits them where needed.

  * **Testing Guard** — it makes sure the test pipeline stays <10 mins, by occasionally removing/replacing low-signal expensive tests or trimming unnecessary CI work.

Most of these guards fetch opportunities in two ways:

  * They scan the work that has been done throughout the day

  * They reflect on the codebase as a whole

Guards are run by OpenClaw and do not make changes directly: they spawn tasks that go into the same backlog as everything else, to be picked up by Codex.

Speaking of Codex 👇

* * *

About one month ago I moved from Claude Code to Codex. The move was prompted by two events:

  * Anthropic (temporarily) suspended my account because they said I was using Claude Code with OpenClaw.

  * I tried GPT 5.4 extensively and it felt it performed better than Opus on my codebase.

I will start by saying the temporary ban felt incredibly misguided. I was already using the API (so, metered usage) for the actual OpenClaw responses, and the only interaction OpenClaw had with Claude Code was to _start_ the process and point it to the Todoist board.

When the ban happened, I was already testing GPT 5.4 so it only accelerated a process that would have happened anyway.

I haven’t tried Opus 4.8 yet, but Codex with GPT 5.4 (and later 5.5) felt obviously better than Claude at the time. In my subjective experience, GPT reflects more about what it needs to do, sticks to instructions better, is more proactive at addressing design problems, and overall just one-shots things more frequently.

I am also a big fan of the Codex macOS app. It is clear, it has the right ergonomics, it is usable from mobile, and overall fits how my brain works very well.

But the true nail in the coffin of my Claude has been... costs 👇

* * *

You may remember that in April I shared this dreadful screenshot of my Anthropic dashboard 👇 pointing at a ~$4000 token cost over the previous 30 days.

[![](https://substackcdn.com/image/fetch/$s_!9ld5!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F43ba7a31-63eb-499b-8be4-e5dc6e3d4b4c_1706x968.png)](<https://substackcdn.com/image/fetch/$s_!9ld5!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F43ba7a31-63eb-499b-8be4-e5dc6e3d4b4c_1706x968.png>)

That cost was mostly driven by the metered usage for OpenClaw, to steer all the product development.

Since then, OpenAI explicitly allowed the Codex plans to be used with OpenClaw, so I happily switched, moving from $4000/mo to... **$200**.

As of today, I use two Codex Pro plans:

  * One for the main coding swimlane, that runs on Codex automations on my Mac Mini

  * One for OpenClaw + occasional coding tweaks I do with Codex on my Macbook.

The overall cost would be `$200*2 = $400`, but OpenAI kindly gifted me with one subscription to develop Tolaria 🙏 so I am only paying for one.

With two plans I _comfortably_ stay within the limits, and basically stopped worrying about usage and cost.

* * *

So what is it that I would like to improve on?

As of today, the biggest bottleneck in my process is applying my **product judgment**. It is no coincidence that there are only 6 issues open, but ~130 feature requests on the [product board](<https://tolaria.canny.io/>).

My product work today is about three things:

  1. Deciding what to build next

  2. Creating good specs for it (or, reviewing the drafts created by the AI)

  3. Reviewing what the AI does (from a product perspective)

Even with a single coding agent that works strictly sequentially (but 24/7), this is more than enough to max out my capacity.

So, improvements to the process need to come more from the product side than the technical side. On the technical side, I would be happy to keep this level of effectiveness, and not have things _degrade_ over time — as it happens with most products and teams.

On the product side, I may improve how AI:

  * **Evaluates / scores feature requests** — to create a more reliable, prioritized backlog.

  * **Creates specs** — so that it needs less steering on my end.

  * **Gets UI/UX right** — so there is less review back & forth.

I have a few ideas about each of these. I guess I’ll try them and let you know next month!

* * *

And that’s it for today! I wish you a great week

Sincerely 👋  
Luca

[![sanjay's avatar](https://substackcdn.com/image/fetch/$s_!JbK2!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16ecccd4-554c-46e7-aa5b-eed1ba546748_144x144.png)](<https://substack.com/profile/26755063-sanjay>)[![Timur Zhigmytov's avatar](https://substackcdn.com/image/fetch/$s_!dExp!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1b3319e0-48b2-45ef-b470-784c23210f96_399x400.png)](<https://substack.com/profile/16858965-timur-zhigmytov>)[![Kamitsuki's avatar](https://substackcdn.com/image/fetch/$s_!-7Ap!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5743ea6c-b72f-4b5b-9b4e-c1b99f00d97a_870x870.jpeg)](<https://substack.com/profile/111602036-kamitsuki>)[![Maurice Klimek's avatar](https://substackcdn.com/image/fetch/$s_!H6U_!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F963828a9-eed9-4f5d-a9ab-603b665d4700_400x400.jpeg)](<https://substack.com/profile/10432226-maurice-klimek>)[![Manik's avatar](https://substackcdn.com/image/fetch/$s_!3WBc!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74a10d8b-1420-4233-9192-11619bdd0d87_144x144.png)](<https://substack.com/profile/280077696-manik>)

68 Likes∙

[5 Restacks](<https://substack.com/note/p-200102476/restacks?utm_source=substack&utm_content=facepile-restacks>)
