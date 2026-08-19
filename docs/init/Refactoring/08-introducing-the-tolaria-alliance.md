---
title: Introducing the Tolaria Alliance! 🦸‍♂️
author: Luca Rossi
source_url: https://refactoring.fm/p/introducing-the-tolaria-alliance
canonical_url: https://refactoring.fm/p/introducing-the-tolaria-alliance
site_name: ''
published_at: '2026-02-25T08:25:55.941Z'
modified_at: '2026-07-01T11:47:17.243Z'
scraped_at: '2026-07-19T18:17:50Z'
content_hash: 756e22c31fc5c77f01ab9fe43eaab847518167ca
markdown_hash: 4e655a90a2e3443f0148029ec51f3372844115d4
ai_summary_short: 'Luca Rossi announces the Tolaria Alliance, a set of open-source
  sponsorships with CodeScene, CircleCI, Codacy, and Unblocked that fund Tolaria''s
  continued free development while letting him share authentic workflow insights.
  He maintains strict ethical boundaries, partnering only with tools he personally
  uses and considers best-in-class, each serving a non-overlapping role in his stack.
  Rossi frames AI code control through three mechanisms: Guides (unreliable instructions),
  Gates (deterministic blocking checks he prioritizes), and Guards (fallback fixes).
  CodeScene serves as a hard local gate enforcing 10/10 code health via a proprietary
  algorithm and hotspot analysis; Codacy surfaces individual quality issues through
  its MCP and blocks pushes, with Rossi collaborating on their new Verity product
  for agent knowledge bases. CircleCI''s Chunk Sidecars solve his local resource crunch
  by running hooks remotely, cutting test suite time from 15 to 4 minutes.'
ai_model: kimi-k2.6
ai_generated_at: '2026-07-19T18:16:31Z'
local_summary_path: pages/p/introducing-the-tolaria-alliance-summary.md
original_images_downloaded: false
---

# Introducing the Tolaria Alliance! 🦸‍♂️

Article voiceover

0:00

-9:54

Audio playback is not supported on your browser. Please upgrade.

This is a special edition of Refactoring and I am so excited about it!

By now, **developing[Tolaria](<https://tolaria.md/>)** is a big chunk of my working time (about 40%, to be precise). I like this balance and I am happy I can regularly write articles about AI coding coming from my own experience, as opposed to pure research.

I also don’t want to end up writing _only_ about that, and so far I have kept a schedule of about **once a month**. This feels like is a good cadence: it’s feel overwhelming for readers, and gives me time to produce actual _updates_ to the workflow, as opposed to posting always the same things.

So, today I am covering a few workflow updates, but most of all I am introducing a **new set of partnerships** I am very proud of.

So let’s dive in!

* * *

First of all you may wonder: how is Tolaria doing? Pretty well, if you ask me.

From a growth perspective, it has now almost **18K stars** on Github, **100K+ downloads** , and thousands of daily active users.

From a product perspective, this month we delivered a ton of updates, including some massive ones, like the support for **native spreadsheets**. 

You can now create and edit spreadsheets inside Tolaria with Excel-compatible formulas in a completely open and portable format, which is basically CSV with a frontmatter on top.

[![](https://substackcdn.com/image/fetch/$s_!-_GB!,w_2400,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fefae0d0d-d7db-467a-892d-75f88b89d2ee_2590x1672.png)](<https://substackcdn.com/image/fetch/$s_!-_GB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fefae0d0d-d7db-467a-892d-75f88b89d2ee_2590x1672.png>)

We also improved a lot of the editor experience, adding **collapsible headings** , block navigation, better spacing and typography, all while making everything **faster than ever**. If you haven’t tried it in a while, you definitely should!

I really enjoy developing (and using!) Tolaria, so the question recently has rather become: how do I make this work sustainable, while keeping everything free and open?

Enter our tech alliance!

* * *

The tools I use to develop Tolaria are no secret — you can figure out most of them by looking at the repo, the [AGENTS](<https://github.com/refactoringhq/tolaria/blob/main/AGENTS.md>) file, hooks, and my own articles.

So, over the last month I reached out to the ones I use the most to figure out if we could work together to make the development of Tolaria more sustainable on my end via open source sponsorships, in return for me spreading the word about how I use such tools, and providing good feedback on how to improve them.

The result is an **alliance** that as of today includes four tools: **[CodeScene](<https://codescene.com/>)** , **[CircleCI](<https://circleci.com/>)** , **[Codacy](<https://codacy.com/>)** , and **[Unblocked](<https://getunblocked.com/https://getunblocked.com/?utm_source=refactoring&utm_medium=newsletter&utm_campaign=tolaria>)**.

These partnerships allow Tolaria to stay free and open forever, and even give us the opportunity to accelerate by hiring a great product engineer (_if you think you are a great fit, please reach out and say hi!_).

So today I will tell you more about my workflow, which includes these tools — but first an ethical statement: I will only _ally_(and stay allied) with tools I personally use and believe are the best way to do what they do. As you will see these are _non overlapping_ : each has its own job, so they really make for my **tech stack**. Over time we will also expand on this and create exclusive deals for Refactoring subscribers!

Before we talk about the tools, it’s worth refreshing how I think about _controls_ for code written by AI. I have written about it in this recent piece 👇

[![My AI Coding Workflow](https://substackcdn.com/image/fetch/$s_!ra1r!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba3740b9-b1f0-462d-8744-8cd1d81d6a81_1714x1138.png)My AI Coding Workflow[Luca Rossi](<https://substack.com/profile/6835984-luca-rossi>)·Jun 3[Read full story](<https://refactoring.fm/p/my-ai-coding-workflow-b09>)](<https://refactoring.fm/p/my-ai-coding-workflow-b09>)

In a nutshell, I _steer_ AI output in three main ways:

  * **↪️ Guides** — instructions in the AGENTS file and skills. Not 100% reliable: the AI may or _may not_ follow them.

  * **🔄 Gates** — deterministic checks that don’t let bad code move forward if some conditions are not met.

  * **↩️ Guards** — fallback procedures that typically run once a day to fix what goes through the cracks.

[![](https://substackcdn.com/image/fetch/$s_!hd-o!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe4e77db0-5966-4432-a71b-fb513f6c6473_1914x908.png)](<https://substackcdn.com/image/fetch/$s_!hd-o!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe4e77db0-5966-4432-a71b-fb513f6c6473_1914x908.png>)

Out of these, the most important part is the **gates** , because they have the (deterministic) power to stop bad code, so the more I can express this way, the better. Most of the tools below are integrated this way.

So let’s go 👇

* * *

[CodeScene](<https://codescene.com/>) probably needs no introduction because I have written about it many times here. I am a big fan of [Adam Tornhill](<https://se.linkedin.com/in/adam-tornhill-71759b48>)‘s work, which to me is about two big things:

  * A proprietary algorithm to calculate code health, that considers 20+ factors.

  * The “hotspot” approach, which looks at git history and suggests refactoring targets prioritizing files that are changed the most often.

[![](https://substackcdn.com/image/fetch/$s_!-9Dp!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F52031750-52f6-4df1-95f0-5460d57455b5_2666x1748.png)](<https://substackcdn.com/image/fetch/$s_!-9Dp!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F52031750-52f6-4df1-95f0-5460d57455b5_2666x1748.png>)It’s nice to see code dependencies and clusters at a glance

I integrate CodeScene as a hard gate in local hooks: new code can’t be committed if it’s not a 10/10. For modifying old code, the AI needs to follow the boy scout rule: leave the code better than it found it. So it measures the code health _before_ touching the file, and _after_ , and the score needs to be the same or higher.

After any commit that improves the overall codebase health, the AI also increases the thresholds, to create a positive flywheel.

After four months working like this, now the code has perfect health, and the [current threshold](<https://github.com/refactoringhq/tolaria/blob/main/.codescene-thresholds>) is literally 10/10!

* * *

[Codacy](<https://codacy.com/>) works on code quality too, but from a different angle: rather than _scoring_ files, it surfaces **individual issues**.

Issues come with severity levels and belong to various categories, like security, performance, compatibility, code being error prone, and more.

Codacy has an MCP that I use to steer my Codex locally, and to implement an actual blocking _gate_ before it pushes any code. All new code has to be issue-free, and when touching old code, the AI also needs to fix existing problems, other than making the business changes.

[![](https://substackcdn.com/image/fetch/$s_!qe5H!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd8652d69-8deb-4d24-8f91-8cba91703730_1954x946.png)](<https://substackcdn.com/image/fetch/$s_!qe5H!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd8652d69-8deb-4d24-8f91-8cba91703730_1954x946.png>)

I am also working with the Codacy team on their new product **[Verity](<https://verity.md/tolaria>) **(you can join the [beta for free here](<https://verity.md/tolaria#pricing>)), that aims to steer agents’ work by creating a knowledge base of past decisions.

This is interesting to me because I do that with ADRs, and would love to create more reliable controls against code that violates them. Verity is promising about that, and should also track token efficiency and a bunch of process metrics that I am interested in improving over time.

* * *

A few months ago I made a change in how I run our test suite, creating local hooks with Husky so that AI agents can immediately see if controls fail, instead of waiting for the remote CI.

This was very effective at improving the agents’ work, at the expense of completely hogging my machine every time. Some parts of the test suite are particularly heavy (e.g. playwright), and running them in local means the whole thing takes time — about 15 mins — and parallelizing things is out of question, because resources are not enough. It’s tricky to run even just 2 worktrees at the same time: things sometimes literally crash.

I talked with [Rob Zuber](<https://www.linkedin.com/in/robzuber/>) from [CircleCI](<https://circleci.com/>) about this, and they implemented a great solution: local hooks that are run remotely, in what they call [Chunk Sidecars](<https://circleci.com/blog/chunk-sidecars/>).

Sidecars are preconfigured environments that run alongside your local workflow, and validate changes as they happen.

[![](https://substackcdn.com/image/fetch/$s_!tPlB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F448719bf-44ac-41a3-9a7f-a99230869258_2152x1300.png)](<https://substackcdn.com/image/fetch/$s_!tPlB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F448719bf-44ac-41a3-9a7f-a99230869258_2152x1300.png>)

This allows to 1) free up your machine resources, and 2) make things faster by introducing real concurrency.

This way I have been able to reduce the suite run time **from 15 to 4 mins** , while also being able to spawn more worktrees safely. A massive win!

* * *

[Unblocked](<https://getunblocked.com/?utm_source=refactoring&utm_medium=newsletter&utm_campaign=tolaria>) is a context engine: it takes information from several sources (e.g. Github, Notion, Slack, Datadog, ...) so you can ask questions about it.

I have known Dennis, Claire, and the team at Unblocked for a long time, but didn’t think of using it for Tolaria until just recently, because I thought that Unblocked would shine when you have _many_ information sources, and we legitimately don’t have many.

I was wrong.

I plugged it about one month ago, connecting it to Github and Sentry. Sentry is useful to triangulate issues, but the Github connection would basically be worth by itself, because it indexes the code, the ADRs, and all the history of changes.

I have been asking questions about how we do this and that and checking side by side with Codex (which instead just greps and fetches things on the go) and the difference in speed and accuracy is just obvious.

[![](https://substackcdn.com/image/fetch/$s_!4tT5!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbd7f01a1-c83f-4da2-a9a7-347a42429fbe_1856x1208.png)](<https://substackcdn.com/image/fetch/$s_!4tT5!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbd7f01a1-c83f-4da2-a9a7-347a42429fbe_1856x1208.png>)

Even more importantly, Codex itself uses Unblocked via the MCP to understand past decisions and fetch relevant ADRs.

Big props to the Unblocked guys because this was an easy win and largely plug-and-play!

* * *

Now that Tolaria has sustainable funding, I am going to invest even more on it. Again, I am exploring hiring a strong product engineer, so if you think you can be a good fit, feel free to reach out and say hi!

As for future work, the most important thing ahead is the **mobile version**.

I already have a working prototype for iPad, but there are still a lot of rough edges. Also, the iPad version is the easy part: for smartphones we need to completely reinvent the UI — I have been working on it 💪

* * *

And that’s it for today! I wish you a great week

Sincerely 👋  
Luca

[![Scott Sterling's avatar](https://substackcdn.com/image/fetch/$s_!xD-I!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F29ae6bde-8673-4137-a0c3-ae1b8e8847b5_1024x1024.webp)](<https://substack.com/profile/232392321-scott-sterling>)[![sanjay's avatar](https://substackcdn.com/image/fetch/$s_!JbK2!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16ecccd4-554c-46e7-aa5b-eed1ba546748_144x144.png)](<https://substack.com/profile/26755063-sanjay>)[![Francesco Ragusa's avatar](https://substackcdn.com/image/fetch/$s_!tNbA!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e57249e-b3a2-4453-aa62-afeb2ec7df03_1287x1284.jpeg)](<https://substack.com/profile/3141270-francesco-ragusa>)[![Manik's avatar](https://substackcdn.com/image/fetch/$s_!3WBc!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74a10d8b-1420-4233-9192-11619bdd0d87_144x144.png)](<https://substack.com/profile/280077696-manik>)[![Joe Langham's avatar](https://substackcdn.com/image/fetch/$s_!W_9E!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff436a647-f749-48eb-9014-faca747a44c0_96x96.jpeg)](<https://substack.com/profile/48088672-joe-langham>)

44 Likes

[](<https://substack.com/note/p-204247813/restacks?utm_source=substack&utm_content=facepile-restacks>)
