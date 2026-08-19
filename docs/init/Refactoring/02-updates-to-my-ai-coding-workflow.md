---
title: Updates to my AI Coding Workflow
author: Luca Rossi
source_url: https://refactoring.fm/p/updates-to-my-ai-coding-workflow
canonical_url: https://refactoring.fm/p/updates-to-my-ai-coding-workflow
site_name: ''
published_at: '2025-04-30T06:01:12.510Z'
modified_at: ''
scraped_at: '2026-05-15T13:59:25Z'
content_hash: c432872b01db76d6581a9dcb17a2d0e42dddd275
markdown_hash: 804d7706bce8b527ae27e4b838d84c9e94e348a2
ai_summary_short: 'Luca Rossi argues that mastering AI coding is the most critical
  problem in software engineering today because it reshapes every downstream activity
  from QA to staffing. He is building Tolaria, a free open-source personal knowledge
  management app designed to serve as a collaboration surface for AI agents, with
  features like automated meeting summaries, voice note processing, and article idea
  generation. His workflow has evolved from a synchronous OpenClaw-to-Claude Code
  chain to an asynchronous split: OpenClaw handles product specs and broad context
  work while Claude Code manages all technical execution including coding, documentation,
  and QA. He enforces quality through mandatory TDD, Kent Beck''s test desiderata,
  the Boy Scout rule for code health improvement, and strict CI gates on CodeScene
  metrics, supplemented by daily refactoring cron jobs and end-of-day retrospectives
  that update his CLAUDE.md file.'
ai_model: kimi-k2.6
ai_generated_at: '2026-05-15T13:58:10Z'
local_summary_path: pages/p/updates-to-my-ai-coding-workflow-summary.md
original_images_downloaded: false
---

# Updates to my AI Coding Workflow

Article voiceover

0:00

-19:18

Audio playback is not supported on your browser. Please upgrade.

About a month ago I wrote an article about my [AI coding workflow](<https://refactoring.fm/p/my-ai-coding-workflow>), and it _instantly_ became the most popular Refactoring article of all time.

I received a lot of private comments, most of which can be organized into two categories:

  * People wanting to learn more about the **coding workflow** itself.

  * People wanting to learn more about the **note-taking** **app** I am building.

Both types of comments motivated me _a lot_ , to the point where I decided to make all of this an official part of my Refactoring work, as follows:

  * I am going to build this app for real, make it free and open source for everyone, and keep working on it as an ongoing effort.

  * I am going to report my learnings about AI coding as part of the regular writing schedule, let’s say once a month or so.

I am convinced this is the right thing to do because, frankly, **getting AI coding right is the #1 problem in software engineering** today, and it’s not even close.

The economics of software are changing so much that there is no part of the process that is _safe_. Code reviews, QA, planning, staffing, traditional management — everything feels up for grabs and _downstream_ of what happens with coding.

Also, while I love doing research and talking with others (e.g. on the podcast), opinions are so scattered across the board that I feel the strong need to try things myself, and do so in a serious, ongoing way.

So here is today’s agenda:

  * 💧 **Building Tolaria** — a personal knowledge management app for the age of AI.

  * 🦞 **OpenClaw vs Claude Code** — how I use them, and to do what.

  * 🔧 **Coding workflow** — what changed vs one month ago, and what stayed the same.

  * 📑 **ADRs** — the best recent addition to my coding.

  * 🎨 **Product workflow** — how I create specs.

  * **💸 How much I am spending** — because I know y’all want to know that.

  * 🤖 **CLAUDE.md** — bonus: my current Claude file, attached in full.

Let’s dive in!

* * *

In the last article I said that what I was building didn’t matter much, well now it kinda does, because you are going to hear a lot more about it in the future.

**[Tolaria](<http://tolaria.md/>)** is a personal knowledge management app, extremely opinionated and tailored for my own personal use, but I hope it can be useful to others too.

[![](https://substackcdn.com/image/fetch/$s_!BUFS!,w_2400,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5e4b8312-6b90-4b72-845a-32b773fd50fa_2934x2983.png)](<https://substackcdn.com/image/fetch/$s_!BUFS!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5e4b8312-6b90-4b72-845a-32b773fd50fa_2934x2983.png>)

It’s worth noting that this is not a particularly original idea. There exist plenty of tools in this space — Notion, Obsidian, Craft, Roam, and more — and most of them are very well made. Still, I know plenty of smart people who lately have been experimenting with weird setups. 

Just last week, [Karpathy wrote a viral tweet](<https://x.com/karpathy/status/2039805659525644595>) exactly about that.

Why such a renewed excitement around **knowledge management**? Because everyone who tries to work _seriously_ with AI agents eventually understands that this is a core problem to solve: continuously _supplying_ agents with reliable, up-to-date information about your life and work, and creating a good collaboration surface on these.

I suspect this still feels a bit abstract, so I’ll make a few examples from my own work:

  * An agent should periodically fetch meeting summaries from tools like Fathom or Fireflies, create a note for the meeting with the summary and action items, and link the note to individual attendees (each of whom should have a page for themselves). If there are attendees who are _new_ , the agent should create individual notes for each of them, enriching my personal CRM.

  * An agent should receive voice notes from me and turn them into long-term notes and tasks, and connect them to the relevant existing pages.

  * An agent should take every new article I write and split it into atomic evergreen ideas, connect them to similar ideas I have already saved in the past, and better organize my knowledge base so that it’s easier to write new articles in the future.

  * An agent should suggest new article topics and podcast guests based on my recent readings and how these connect to things I have written in the past and interviews I already did.

In terms of intelligence required, most of these tasks are **trivial**. But they need a good collaboration surface 1) for agents to fetch the relevant info and 2) for me to work well with them.

[Tolaria](<https://tolaria.md/>) is my attempt to build this for myself first, and hopefully for some others too.

It will be completely**free and open source** , so that it also works as a **visible artifact** of my _understanding_ of how to create products with AI, for other people to inspect.

At any given time, if you want to know e.g. what I write in my CLAUDE.md, or how I write docs, or what types of tests I write and which I don’t — you shouldn’t just _trust_ my articles, you should be able to go to the repo and see for yourself.

This way, the ideas you read on Refactoring become the result of three things:

  * **📚 Research** — I read and collect experiences from others.

  * 💬 **Conversations** — I go deeper by running community events and 1:1 podcast interviews.

  * 🔧 **Personal work** — I do coding and product development myself to stress-test these beliefs.

All of these elements are meant to be _public_ : you can get [weekly digests](<https://refactoring.fm/i/193052967/weekly-readings>) of what I read, listen to the [podcast conversations](<https://refactoring.fm/podcast>), [join the community](<https://refactoring.fm/p/refactoring-community>) to chat with me (and others), and inspect the Tolaria codebase (soon!) to see how I write code.

Tolaria is not ready yet but it will be in a couple of weeks!

So where are we today? Here is an exec summary. Since I started working on it around mid Feb, here is what I got:

  * **1526 commits** — that is ~30 commits/day on average

  * **~70K LOCs** — about 45 lines / commit

  * **~3000 tests** — about 85% coverage

  * **9.5/10 code health** — as measured by CodeScene

  * **40+ ADRs** — to track our core tech choices, plus three summary docs for Architecture, Abstractions, and Getting Started.

That’s 2.5x the amount of code we had last month (we were at 20K LOCs), with better code health (9.5 vs 9.3), and better docs. I am still not writing any code, and I am still reading very little of it.

The product also got way better to the point where, by now, I have fully replaced my Notion workspace. It still feels surreal to say that out loud, after 6+ years of really intensive Notion usage, but here we are.

So let’s get into how I work on it, starting with coding 👇

* * *

In last month’s [post](<https://refactoring.fm/p/my-ai-coding-workflow>) I said that basically I acted as CEO, OpenClaw worked as a PM, and Claude Code worked as a team of designers + engineers.

Has any of this changed? Yes, and no. Roles are still kinda the same, but I am not using Claude Code strictly _together_ with OpenClaw anymore, in the sense that the latter directs the former, but more in an async way. This change has been driven by three reasons:

  * 💸 **Cost** — the initial workflow in which OpenClaw steered CC all the time was wildly inefficient in terms of token spend.

  * 🎓 **Capabilities** — CC has caught up with a lot of OpenClaw stuff. Most of all, it has loops now.

  * 👮‍♂️ **Legal** — most recently, Anthropic has explicitly banned this type of usage, but to be fair I had stopped it already.

So by now my OpenClaw and Claude Code work on separate things, in a completely asynchronous way:

  * OpenClaw turns my inputs into product specs, checks on the general status of things, brainstorms new ideas, and in general does the work that benefits from _broad_ context.

  * Claude Code does all the technical work, including coding, writing ADRs and docs, and, crucially, QA, that was done by OpenClaw before.

OpenClaw doesn’t interact with Claude Code anymore, but it periodically checks that it doesn’t get stuck or crashes (which can happen for a variety of reasons). In that case, it restarts it.

* * *

This article is largely meant to work as a _delta_ vs my original AI coding article to highlight things that have changed, but it’s also worth noting the good stuff that _has not changed._

The highest leverage parts of the AI coding workflow are _still_ probably the CI gates on **code health** and **test coverage**. These gates exist in two places:

  * In commit hooks — so Claude gets immediately notified and can fix, and

  * In the CI — as a last resort

As of today, these have been effective at maintaining good quality and we are sitting at ~9.8 hotspot code health on CodeScene, for ~70K lines of code. This is _very_ hard to achieve with pure human code, and reinforces the idea that we should use AI to write _better_ code than we would do ourselves.

I also want to stress, for people who are not a lot into code health, that this is real and meaningful. Code health is about small files, cohesive responsibilities, low coupling, low cyclomatic complexities, and pretty much everything that we, as humans, judge as good code.

However — and that’s something I have changed — I have also found that gates and thresholds alone are not an efficient way to **enforce quality**. If you don’t _guide_ agents about ways to stay on track and improve these scores, they will meet a lot of failures, get _frustrated_ with them, and try to overcome them. 

The more failures Claude gets, the more likely it will try a workaround like “**let’s skip this test** ”, or “let’s add this file to the codescene ignored list”.

To avoid this, here is what I gradually added to the CLAUDE.md:

  * **Red/green testing** — make the agent do TDD. Effective to ensure coverage and reduce the amount of code written.

  * **[12 test desiderata](<https://medium.com/@kentbeck_7670/test-desiderata-94150638a4b3>)** — by Kent Beck, about what a good test looks like.

  * **Boy scout rule** — by Robert Martin. Claude should leave the code in a better state than it found it. Which means, when it has to make any change, it will 1) look at the code health score _before_ the change, 2) make the change, and 3) measure that code health actually improved.

I also have two daily cron jobs that help:

  * Once a day Claude goes through files with low code health and does some refactoring.

  * At the end of the work day Claude does a retrospective about the problems it encountered during the day, and writes improvements to the CLAUDE.md file. It also has a strict rule of keeping the file under 150 lines.

Aside from that, as I mentioned before I just moved the QA responsibility from OpenClaw to Claude, which now, on top of writing tests for everything, tests the app _manually_ via:

  * Chrome MCP and dev tools, and

  * Keyboard commands via Osascript

The second one is particularly important because I learned that AI is still not good at using the mouse, so better not to rely on it. Tolaria has now a principle by which every feature needs to be keyboard-first, which works well both for people and AI.

🎁 **I attached the full CLAUDE.md file at the bottom of this article**

* * *

I have had “summary” docs about the latest state of architecture and abstractions since the beginning, but I have missed for a long time a way to capture individual big changes and the reasoning behind them.

[![](https://substackcdn.com/image/fetch/$s_!buZv!,w_2400,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fac6fe6ac-69eb-4e45-aac8-deb0c00a6df7_2216x678.png)](<https://substackcdn.com/image/fetch/$s_!buZv!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fac6fe6ac-69eb-4e45-aac8-deb0c00a6df7_2216x678.png>)

Two weeks ago I started having Claude write ADRs about these, and after a few tweaks, I am happy with how it works.

When Claude needs to implement a feature, now:

  1. It looks at what exists, both in code and ADRs,

  2. Takes inspiration from past decisions

  3. Creates a new ADR if something is new and relevant

  4. Possibly tags old ADRs as _superseded_ when a new decision makes them so.

ADRs also work as a great _intermediate_ artifact for me as a human to review, as opposed to individual lines of code.

This is the template I use for them:
[code]
    ---
    type: ADR
    id: "0001"
    title: "Short decision title"
    status: proposed   # proposed | active | superseded | retired
    date: YYYY-MM-DD
    superseded_by: "0007"  # only if status: superseded
    ---
    
    ## Context
    What situation led to this decision? What forces and constraints are at play?
    
    ## Decision
    **What was decided.** State it clearly in one or two sentences — bold so it stands out.
    
    ## Options considered
    - **Option A** (chosen): brief description — pros / cons
    - **Option B**: brief description — pros / cons
    - **Option C**: brief description — pros / cons
    
    ## Consequences
    What becomes easier or harder as a result?
    What are the positive and negative ramifications?
    What would trigger re-evaluation of this decision?
    
    ## Advice
    *(optional)* Input received before making this decision — who was consulted, what they said, when.
    Omit if the decision was made unilaterally with no external input.
    
[/code]

And the rules Claude follows to create them:

  * One decision per file

  * Files named `NNNN-short-title.md` (monotonic numbering)

  * Once `active`, never edit — supersede instead

  * When superseded: update `status: superseded` and add `superseded_by: "NNNN"`

  * ARCHITECTURE.md reflects the current state (active decisions only)

* * *

In terms of product, has anything changed in my workflow? Yes, but in an incremental way.

OpenClaw still writes product specs, as it did one month ago, and the interaction style is still: 1) I input messy ideas, via voice notes or quick chat, and 2) it turns them into full-fledged specs. What’s changed over this month is the **amount and quality of shared context** it can draw from, when creating such specs:

  * We have a VISION.md file with plenty of principles that it uses to take inspiration from.

  * We have a better organized design system as a .pen Pencil file, that is useful both to OpenClaw and Claude.

  * We have ADRs that capture key tech decisions in chronological order.

We have also improved communication a bit by making parts of the process more explicit. We always have a shared board on Todoist, but now when a task gets moved to Done, Claude needs to write a comment that explains:

  * **QA** — what it has tested

  * **ADRs** — whether it added anything

  * **Docs** — what it updated

So how do I actually work on this, as a human?

I usually do a 30-min review of everything that needs to be reviewed first thing in the morning — via voice notes. That spawns ~10 tasks on average, which are usually done by lunch. I do the same after lunch, and at the end of the day. I also use Tolaria pretty much all day, so I report more ideas and bugs during the day. All in all, it’s ~2 hours of work per day.

I do 90% of this via voice notes. Voice has completely changed how I do _everything_ these days, but that’s a story for another time.

* * *

So is it all sunshine and roses? Not exactly. The process _works_ and so far I haven’t hit a hard limit, nor do I feel I am getting diminishing returns, but it still pretty much needs human oversteer. All kinds of things can happen that you need to intercept:

  * **OpenClaw misunderstands some feature idea** — and Claude implements a different thing completely. Classic [telephone game](<https://refactoring.fm/p/the-telephone-game-of-software>).

  * **Features are delivered broken** — there are things the AI is still not good at: pixel-perfect stuff, mouse usage, retrocompatibility, etc.

  * **Claude gets frustrated and tries to bypass gates** — it lowers code health thresholds, games test coverage, and more. This stuff still happens multiple times a week!

  * **Some docs don’t get updated** — occasionally, ADRs are not created, some old stuff is not deleted, and some docs gradually _rot_ into obsolescence.

The root cause of these is that the AI simply **ignores your instructions** every now and then. It doesn’t matter how crisp, short, and clear these are — I have found that ~10% of the time, Claude will just ignore what you say. So you can’t really go hands off.

* * *

Finally, let’s talk numbers! I intentionally worked the first 30 days _without_ caring too much about expenses, because I just wanted to see how far I could go with procedures and workflows.

[![](https://substackcdn.com/image/fetch/$s_!HwHT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed91f263-d092-4aae-8471-54785603f16e_2322x1314.png)](<https://substackcdn.com/image/fetch/$s_!HwHT!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed91f263-d092-4aae-8471-54785603f16e_2322x1314.png>)The first 30 days were brutal — but these days it’s a way more manageable $50-60/day

After a rather humbling **~$4,000 bill** , I spent the following weeks optimizing things, and I am happy to report that you can actually go a long way with it, by:

  * Reducing the amount of context the agent loads at every session

  * Making procedures clear and short

  * Inspecting OpenClaw telemetry to find the biggest offenders. OpenClaw dashboard is very clear on where usage goes.

Biggest learning was that QA is super expensive — taking screenshots, navigating the app with the keyboard, etc. So even if _sometimes_ it found bugs that Claude didn’t find, I removed this second pass of review and I only kept Claude doing it.

As of today, most days are around $50-60 of token spend (plus the $200/mo Claude Max), which is not cheap by any means, but still good bang for buck if you ask me.

Now you might be thinking: Luca if you were able to reduce your token spend by moving more stuff to Claude… that means Claude Max is heavily subsidized! Yes it is, but this doesn’t mean we’ll end up spending tens of thousands / month when the tide goes out. Some open models are already _very_ good at coding. [Composer 2](<https://cursor.com/blog/composer-2>) is basically Kimi 2.5 fine-tuned, it performs close to Opus 4.6, and costs less than 1/10th.

So, as I have said many times by now, I really don’t know how big AI labs will ever be able to turn any profit, given how quickly open source is catching up. But I digress.

* * *

Finally, since many have asked, here is the current CLAUDE file I am using. Will also open source the full repo in a couple of weeks, so consider this a small preview.

Worth noting that I write/edit almost none of it — it’s all Claude and OpenClaw that steer it. They also try to keep it under 150 LOCs, to avoid context rot.

p.s. you will see the “Laputa” name a lot, because that’s the previous name of the app, before I renamed it to Tolaria for obvious localization problems 🫠
[code]
    # CLAUDE.md — Laputa App
    
    > Quick links: [Architecture](docs/ARCHITECTURE.md) · [Abstractions](docs/ABSTRACTIONS.md) · [Wireframes](ui-design.pen)
    
    ---
    
    ## 1. Task Workflow
    
    ### 1a. Pick up a task
    
    Run `/laputa-next-task` — fetches next task (To Rework first, then Open), moves to In Progress, returns full description.
    
    **Before writing a single line of code:** run `mcp__codescene__code_health_score` to check the current codebase health against `.codescene-thresholds`. If the score is already below the threshold, **stop and refactor first** — find the worst files with the MCP, improve them, commit, then start the task. Never start feature work on a codebase that is already below the gate.
    
    - Read task description and all comments fully
    - For To Rework: the ❌ QA failed comment tells you exactly what to fix
    - Check `docs/adr/` for relevant architecture decisions before structural choices
    - Add a comment: `🚀 Starting work on this task. [Brief description of approach]`
    
    ### 1b. Implement
    
    - Work on `main` branch — **no branches, no PRs, ever**
    - Commit every 20–30 min: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
    - **⛔ NEVER use --no-verify**
    - For UI tasks: open `ui-design.pen` first, study visual language, design in light mode
    
    ### 1c. When done
    
    **Phase 1 — Playwright (only for core user flows):**
    
    Write smoke test in `tests/smoke/<slug>.spec.ts` only if feature touches: vault open, note create/save/delete, search, wikilink navigation, git commit/push, conflict resolution. Do NOT write Playwright tests for cosmetic changes — use Vitest instead. Suite must stay under **10 minutes**.
    
    ```bash
    pnpm dev --port 5201 &
    sleep 3
    BASE_URL="<http://localhost:5201>" npx playwright test tests/smoke/<slug>.spec.ts
    
    **Phase 2 — Native app QA:**pnpm tauri dev & sleep 10
    bash ~/.openclaw/skills/laputa-qa/scripts/focus-app.sh laputa
    bash ~/.openclaw/skills/laputa-qa/scripts/screenshot.sh /tmp/qa-native.png
    
    Use osascript for keyboard interactions. Write result as Todoist comment (✅ or ❌). **⚠️ WKWebView:** osascript keystroke blocked inside editor — rely on Playwright for text input features.
    
    After both phases pass, add a **completion comment** to the Todoist task before running /laputa-done. The comment must include:
    - What was implemented (1–2 lines)
    - QA: what was tested and how (Playwright / native screenshot / osascript)
    - Refactoring: any files refactored to meet the CodeScene gate (or “none needed”)
    - ADRs: any new/updated ADRs (or “none”)
    - Docs: any updated docs ([ARCHITECTURE.md](<http://ARCHITECTURE.md>), [ABSTRACTIONS.md](<http://ABSTRACTIONS.md>), etc.) (or “none”)
    - Code health: final Hotspot and Average scores after push
    Then run /laputa-done <task_id> → moves to In Review, notifies Brian, self-dispatches next task.
    ---
    
    ## 2. Development Process
    
    ### Commits & pushes
    
    - Push directly to `main` — no PRs, no branches
    - Pre-push hook runs full check suite (build + tests + Playwright + CodeScene)
    - **A task is NOT done until `git push origin main` succeeds.** If the hook blocks: read the error, fix it (clippy, tests, CodeScene, build), commit the fix, push again. **⛔ NEVER use --no-verify**
    
    ### TDD (mandatory)
    
    Red → Green → Refactor → Commit. One cycle per commit. For bugs: write failing regression test first, then fix. Exception: pure CSS/layout changes.
    
    **Test quality (Kent Beck's Desiderata):** Isolated · Deterministic · Fast · Behavioral · Structure-insensitive · Specific · Predictive. Fix flaky tests first. Prefer E2E over unit tests for user flows.
    
    ### Code health (mandatory)
    
    Pre-commit and pre-push hooks enforce **Hotspot Code Health** and **Average Code Health** ≥ thresholds in `.codescene-thresholds`. Both gates block commit/push. Thresholds are a **ratchet** — only go up, auto-updated after each successful push. Never add `// eslint-disable`, `#[allow(...)]`, or `as any`.
    
    **⛔ NEVER edit `.codescene-thresholds` to lower the values.** If the gate blocks you, improve the code — do not lower the bar.
    
    **Before every commit:** run `mcp__codescene__code_health_review` on files you touched and verify score is higher. **Boy Scout Rule:** every file you touch must leave with a higher score.
    
    **If CodeScene gate blocks your push:** use `mcp__codescene__code_health_score` to find the worst file, refactor it, commit, push again. Do NOT stop or wait for laputa-refactor — that is a background loop, not a substitute for fixing your own regressions.
    
    ### Check suite (runs on every push)
    ```bash
    pnpm lint && npx tsc --noEmit && pnpm test && pnpm test:coverage  # frontend ≥70%
    cargo test && cargo llvm-cov --manifest-path src-tauri/Cargo.toml --no-clean --fail-under-lines 85
    ```
    
    ### ADRs & docs
    
    ADRs live in `docs/adr/`. Create in the same commit as the code. Never edit existing — create a new one that supersedes. Use `/create-adr`. **When:** new dependency, storage strategy, platform target, core abstraction, cross-cutting pattern. **Not for:** bug fixes, styling, refactors.
    
    After any Tauri command, new component/hook, data model change, or new integration: update `docs/ARCHITECTURE.md`, `docs/ABSTRACTIONS.md`, and/or `docs/GETTING-STARTED.md` in the same commit.
    
    ---
    
    ## 3. Product Rules
    
    ### User vault (`~/Laputa/`)
    
    Default to `demo-vault-v2/`. If you must use `~/Laputa/` for testing: **never commit changes** — always run `cd ~/Laputa && git checkout -- . && git clean -fd` when done.
    
    ### UI design
    
    Open `ui-design.pen` first (light mode). Create `design/<slug>.pen` for the task; on completion merge into `ui-design.pen` and delete it.
    
    ### UI components — mandatory rules
    
    **Always use shadcn/ui components.** Never use raw HTML form elements (`<input>`, `<select>`, `<button>`, native `<input type="date">`, etc.) for user-facing UI. Every interactive element must use the shadcn/ui equivalent:
    
    | Need | Use |
    |---|---|
    | Text input | `Input` from shadcn/ui |
    | Dropdown/select | `Select` from shadcn/ui |
    | Date picker | `Calendar` + `Popover` from shadcn/ui (NOT native `<input type="date">`) |
    | Button | `Button` from shadcn/ui |
    | Autocomplete/combobox | Reuse existing combobox components from the app (check `src/components/`) |
    | Wikilink picker | Reuse the wikilink autocomplete component already used in the editor and Properties panel |
    | Emoji picker | Reuse the emoji picker component already used for note/type icons |
    | Color picker | Reuse the color swatch picker used for type customization |
    | Toggle/switch | `Switch` or `ToggleGroup` from shadcn/ui |
    | Dialog/modal | `Dialog` from shadcn/ui |
    
    **When in doubt:** search `src/components/` for an existing component before building new. **Visual language:** all new UI must feel native to Laputa — if it looks like a browser default, it's wrong.
    
    ---
    
    ## 4. Reference
    
    ### macOS / Tauri gotchas
    
    - `Option+N` → special chars on macOS. Use `e.code` or `Cmd+N`
    - Tauri menu accelerators: `MenuItemBuilder::new(label).accelerator("CmdOrCtrl+1")`
    - `app.set_menu()` replaces the ENTIRE menu bar — include all submenus
    - `mock-tauri.ts` silently swallows Tauri calls — not a substitute for native testing
    ### QA scripts
    
    ```bash
    bash ~/.openclaw/skills/laputa-qa/scripts/focus-app.sh laputa
    bash ~/.openclaw/skills/laputa-qa/scripts/screenshot.sh /tmp/out.png
    bash ~/.openclaw/skills/laputa-qa/scripts/shortcut.sh "command" "s"
    ```
    
    ### Diagrams
    
    Prefer Mermaid (`flowchart`, `sequenceDiagram`, `classDiagram`, `stateDiagram-v2`). ASCII only for spatial wireframe layouts.
[/code]

* * *

And that’s it for today! I wish you a great week

Sincerely 👋  
Luca

[![Manik's avatar](https://substackcdn.com/image/fetch/$s_!3WBc!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74a10d8b-1420-4233-9192-11619bdd0d87_144x144.png)](<https://substack.com/profile/280077696-manik>)[![sanjay's avatar](https://substackcdn.com/image/fetch/$s_!JbK2!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16ecccd4-554c-46e7-aa5b-eed1ba546748_144x144.png)](<https://substack.com/profile/26755063-sanjay>)[![Anderson Gonzalez's avatar](https://substackcdn.com/image/fetch/$s_!PGOf!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7daa5a51-8fb1-4d22-a9c1-3f20939f96f0_1110x1110.png)](<https://substack.com/profile/110253482-anderson-gonzalez>)[![Brandon Hines's avatar](https://substackcdn.com/image/fetch/$s_!e3hP!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc57be56a-ddd0-4ffa-8d08-98b66b4f59af_542x752.png)](<https://substack.com/profile/314520503-brandon-hines>)[![Arsalan Akhter's avatar](https://substackcdn.com/image/fetch/$s_!y_oQ!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F58bb6f38-45b9-42c9-a712-4273c7289404_460x460.jpeg)](<https://substack.com/profile/18488959-arsalan-akhter>)

55 Likes∙

[2 Restacks](<https://substack.com/note/p-193368488/restacks?utm_source=substack&utm_content=facepile-restacks>)
