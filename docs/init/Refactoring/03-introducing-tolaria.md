---
title: Introducing Tolaria 💧
author: Luca Rossi
source_url: https://refactoring.fm/p/introducing-tolaria
canonical_url: https://refactoring.fm/p/introducing-tolaria
site_name: ''
published_at: '2025-04-30T06:01:12.510Z'
modified_at: ''
scraped_at: '2026-05-14T17:25:25Z'
content_hash: 97ceffec2759513601c71db835fb5db712881635
markdown_hash: b235b5e42b9ed8dc40799a1305a25505c32fdd83
ai_summary_short: 'Luca launches Tolaria, a free open-source Mac desktop app for managing
  markdown knowledge bases, which he built to replace Notion after migrating to markdown
  files for speed, control, and better AI integration. He positions Tolaria as his
  answer to Karpathy''s LLM wiki, designed to capture and organize personal and work
  context so AI can deliver maximum value, with the core principle that such material
  must remain portable and under user control rather than locked into any single platform
  or AI vendor. The app is built on four foundational beliefs: plain files for portability
  and AI compatibility, markdown as the de facto AI-era document standard, Git for
  version control and sync, and open source for long-term autonomy, supplemented by
  additional commitments to rich visual UX, keyboard-first operation, and opinionated
  workflows that optimize daily use.'
ai_model: kimi-k2.6
ai_generated_at: '2026-05-14T17:24:15Z'
local_summary_path: pages/p/introducing-tolaria-summary.md
original_images_downloaded: false
---

# Introducing Tolaria 💧

Hey, Luca here — the wait is over! After [teasing it](<https://refactoring.fm/p/updates-to-my-ai-coding-workflow>) during the last month, today I am making [Tolaria](<http://tolaria.md/>) available to everyone, free and open source. You can find it [here](<https://github.com/refactoringhq/tolaria>) and download the latest release.

[Check out Tolaria 💧](<https://github.com/refactoringhq/tolaria>)

Tolaria is a desktop app for Mac for managing **markdown knowledge bases**. In a way, it’s my own version of [Karpathy’s LLM wiki](<https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f>).

I have a close circle of friends who have been using it over the past few weeks, and they use it to operate:

  * Second brains and personal knowledge

  * Company docs as context for AI

  * OpenClaw / assistants memory and procedures

Personally, I use it to **run my life and work**.

I have a massive workspace of 10,000+ notes, which are the result of 6 years of Refactoring work + a ton of personal journaling and _second braining_.

[![](https://substackcdn.com/image/fetch/$s_!XRY5!,w_2400,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F931c128f-2158-4eec-a282-d8c6cdb27137_3982x2612.png)](<https://substackcdn.com/image/fetch/$s_!XRY5!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F931c128f-2158-4eec-a282-d8c6cdb27137_3982x2612.png>)Tolaria is the best app I have ever used for managing markdown knowledge bases.

Earlier this year I decided to migrate everything from Notion to markdown files for a variety of reasons (speed, control, better AI work), but I missed an app that allowed me to operate these files with a UX that fit my brain — so I built it! 

So, this newsletter will explain a few things:

  * 📹 **Walkthroughs** — how I use Tolaria for various stuff.

  * **🌀 Tolaria + Refactoring** — how Tolaria fits the broader Refactoring picture, and my life.

  * **⭐ Tolaria Principles** — things I believe in, on top of which Tolaria is built.

  * **🔧 How Tolaria works** — the main parts.

  * **🔬 What you will find in the repo** — interesting stuff you may look at.

Also, as I wrote before, I commit to keeping you posted about my AI coding workflow, and I will use Tolaria and its repo as a _living artifact_ of how I create software with AI, trying to staying on the frontier of what’s possible, trying new things, and so on.

Tolaria will stay free forever, but if you want to **stay posted with these explorations** and support my work, consider subscribing to the paid version of Refactoring 👇

p.s. we’ve recently launched our [AI Club](<https://refactoring.fm/p/introducing-the-ai-club>) and will run the first edition next month. I’d love to see you there!

* * *

Before you move further, you can find some Loom walkthroughs below — they are short and to the point:

  * [How I Organize My Own Tolaria Workspace](<https://www.loom.com/share/bb3aaffa238b4be0bd62e4464bca2528>)

  * [My Inbox Workflow](<https://www.loom.com/share/dffda263317b4fa8b47b59cdf9330571>)

  * [How I Save Web Resources into Tolaria](<https://www.loom.com/share/8a3c1776f801402ebbf4d7b0f31e9882>)

I recorded them because I think it’s way easier to see things in action than to read long explainers. So if you like what you see, you can continue reading below 👇

* * *

In this time of rapid change, deciding how I spend my time feels like a big deal. Tolaria is taking _a lot_ of it, so it needs to be worth it, and I think it is.

With Refactoring I write about **how to create good software** — that’s how I literally make a living. Over the last few years I have done that largely by 1) doing research and 2) talking with the smartest people I knew.

With everything that’s happening with AI, this is not enough anymore.

Everyone needs **hands-on work** to understand what’s really happening, and form opinions that are not mediated by other people’s experience.

Also, in order to make for good evidence, such work needs to be _ambitious_. Side projects are nice, but can we build _real_ , complex software with AI, without writing a single line of code? What about without _reading_ it? Does it scale? Or do we _drift_ into chaos?

So far, it scales. 

Tolaria is not _massive_ , but at this point it is not small either. By the numbers:

  * 100K lines of code, in Rust + React.

  * 1900+ commits

  * 3000+ tests

  * 70 ADRs

I have written more about how I work on it in this [recent piece](<https://refactoring.fm/p/updates-to-my-ai-coding-workflow>).

[![](https://substackcdn.com/image/fetch/$s_!AnY2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c1b074e-0b95-41a1-9a0b-232431d670fe_1556x432.png)](<https://substackcdn.com/image/fetch/$s_!AnY2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c1b074e-0b95-41a1-9a0b-232431d670fe_1556x432.png>)My incredible (for me) Github graph for 2026. My most prolific year before this one had 900 commits — for the full year.

So, my commitment with Tolaria is the following:

  * I will keep it free & open source forever.

  * I will run my life and business on it.

  * I will work 2+ hours / day on it to develop new things, fix problems, and make it useful for people other than myself.

  * I will do as much of the work as possible with AI, trying to _live in the future_.

  * I will keep you posted on Refactoring about this process.

In a nutshell, the goal is to **work on the frontier and report back to you**.

* * *

So, what is Tolaria about? When I speak with friends, jokingly I say that it’s like Notion, but offline, and for actual files. This is not 100% correct, but it’s a good starting point.

Tolaria is based on a simple belief: **AI delivers the biggest benefits to those who are able to capture and organize context** — whether it’s about their lives or work.

We often talk about “knowledge” management but it’s not only about knowledge: it’s about projects, goals, thoughts, relationships, and everything that happens in your lives. The more you can capture (and organize properly), the more AI can be useful to you.

Such material is, potentially, our most precious asset. We’ll want to keep it tidy, up to date, and most of all, **under our control**.

Keeping it under our control means not being locked into a specific tool or AI platform. It means being able to switch to different AIs by snapping your fingers, or using multiple ones together on the same collaboration surface.

You may want your Claude Code to do some autonomous research and write its findings, while your OpenClaw fetches your latest meeting notes and turns them into a doc, all while you write manually in your journal, or capture a valuable idea into an _evergreen note_.

This should all be possible and be backed by the same knowledge base.

Based on this, here is how I think such a knowledge base should work:

  * **Files** — because of 1) portability, 2) offline work, and 3) how AI is massively good at working with them, files are an obvious choice for a knowledge base.

  * **Markdown** — md has surfaced as the de-facto standard for documents in the AI era. And you can easily extend it with a YAML frontmatter to store structured properties

  * **Git** — by using files, version control is an obvious fit. This is useful for 1) history, for 2) cloud sync, and for 3) tracking authorship of changes, especially in a world where humans and AI collaborate.

  * **Open source** — if the goal is full & long-term portability, the app you use to operate your knowledge should stay under your control.

While the above items are the *core *principles, there are a few others I strongly believe in:

  * **Rich UX** — there are a lot of markdown editors out there who are simply… editors. This just doesn’t cut it when you have a lot of notes and need to operate _years_ of content. You need relationships, visual cues, navigation, colors, icons, stuff that tells you at a glance _what_ a note is, where it lives, and so on.

  * **Keyboard-first** — I am a developer at heart, so the more I can do via the keyboard, the better. In Tolaria there are shortcuts and commands for _everything_ , and tab navigation works well, so you never need the mouse.

  * **Opinions** — capturing and organizing knowledge is hard, so I will bring my point of view about it. When you do something every day, you need UX that is optimized for that, and you can only achieve that if your tool has opinions. Tolaria has many!

* * *

Tolaria is organized into a few main components:

  1. **Sidebar** — for filtering notes in various ways

  2. **Note list** — for displaying the list of notes that match the current selection in the sidebar

  3. **Editor** — for editing the current note.

  4. **Status bar** — for changing vault, check Git status, AI status, and handy stuff

[![](https://substackcdn.com/image/fetch/$s_!wtwc!,w_2400,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2d9bac09-4c77-4205-9618-4a076ffd9fe7_3982x2612.png)](<https://substackcdn.com/image/fetch/$s_!wtwc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2d9bac09-4c77-4205-9618-4a076ffd9fe7_3982x2612.png>)

Let’s look at each of these 👇

* * *

One of the core things you want to do when you have a lot of notes, is looking at just a subset of them at a time, based on various criteria.

Tolaria allows you to do so in many ways:

Notes that haven’t been _organized_ yet.

This is inspired by [Tiago Forte](<https://www.buildingasecondbrain.com/>)‘s concept of separating capture from organize. An “organized” note is a note that you know what you will do with. It may belong to a project, to a responsibility, a topic, or any concept related to how you organize work.

Review your inbox (e.g.) weekly to keep it from growing too large. You can disable the Inbox in Settings `cmd+,`) if you don’t like this workflow.

You can flag a note as _organized_ by clicking on the “check” icon in the breadcrumbs bar, or with `cmd+e`.

As the name suggests, that’s the entire vault — every single note.

A permanent home for notes you don’t want to delete but don’t want to see regularly. Archive aggressively to keep your vault clean. Archived notes still appear in search results, but not in sidebar sections.

The main organizational device in Tolaria. Each note has a type, which by default is Note.

Each type can have its own icon and color, which you can change by right-clicking on it in the sidebar, or manually changing it in the properties or frontmatter of the type file.

Types are simply stored as markdown files, like Topic, or Project.

Click any type on the sidebar to see all notes of that type in the note list.

Notes you’ve manually pinned to keep them top-of-mind. Great for active projects, journal entries, or reference notes you access frequently.

You can reorder them by dragging them in the sidebar.

Toggle a favorite note from the ⭐ button in the breadcrumbs bar, or with `cmd+d` .

You can create custom views that filter notes by complex, nested criteria. The view editor fetches all available properties, plus allows for some tricks (like regexes and natural language dates)

[![](https://substackcdn.com/image/fetch/$s_!GEjx!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7752a1eb-1390-48b4-a11e-b08edd488c4b_1594x932.png)](<https://substackcdn.com/image/fetch/$s_!GEjx!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7752a1eb-1390-48b4-a11e-b08edd488c4b_1594x932.png>)

Views are simple yaml files that get stored in the `views` folder. They can be edited easily and even created by the AI 👇
[code]
    name: Active Projects
    icon: 🚀
    filters:
      all:
      - field: type
        op: equals
        value: Project
      - field: Status
        op: equals
        value: Active
      - any:
        - field: status
          op: equals
          value: active
        - field: date
          op: after
          value: in 1 week
[/code]

Tolaria stores notes in the root of the vault by default, but also scans your vault’s folder structure, which you can navigate at the bottom of the sidebar.

Folders are listed last because they are a secondary organization method—not the primary one.

There is no trash bin, when you delete a note, it’s gone — but your git history is your safety net. You can always recover deleted notes from git if needed.

* * *

The note list shows the subset of notes selected by the current sidebar section. For example, clicking “Types → Project” shows all your Project notes.

You can sort the note list by any note property (they get dynamically loaded from the notes), plus file properties like modified and creation time.

Your choice will be remembered for that specific section.

[![](https://substackcdn.com/image/fetch/$s_!6J5P!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fce56bac2-2145-40b1-bf4e-9fa3cb70977d_1264x510.png)](<https://substackcdn.com/image/fetch/$s_!6J5P!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fce56bac2-2145-40b1-bf4e-9fa3cb70977d_1264x510.png>)

You can customize which properties appear as columns in the note list. This lets you see important metadata at a glance without opening individual notes.

[![](https://substackcdn.com/image/fetch/$s_!BTJA!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F88e9cadc-dfad-480f-95dd-e08baf88fea1_1252x422.png)](<https://substackcdn.com/image/fetch/$s_!BTJA!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F88e9cadc-dfad-480f-95dd-e08baf88fea1_1252x422.png>)

For properties that are URLs or other notes, you can open them directly from the note list with `cmd+click`.

* * *

The editor is where you write and edit your notes. Tolaria supports two modes:

  * **WYSIWYG Mode** — similar to Notion. Type naturally, use slash commands, and see the output directly formatted in the editor.

  * **Raw mode** — shows the actual file characters. Access it with `Cmd+/` or the code button in the breadcrumb bar. Useful when you need precise control over markdown syntax.

The note’s filename is always visible at the top of the editor. This keeps you aware of how the note will be named and linked.

A very important feature of the editor is the support for **wikilinks**. Type `[[` to trigger autocomplete from your entire vault. This creates links to other notes, enabling the knowledge graph. Wikilinks also auto-update if the filename changes.

[![](https://substackcdn.com/image/fetch/$s_!0t5g!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F085c0f73-8af3-46d1-88ae-4bb349cd06ee_1580x1152.png)](<https://substackcdn.com/image/fetch/$s_!0t5g!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F085c0f73-8af3-46d1-88ae-4bb349cd06ee_1580x1152.png>)

* * *

Tolaria vault have first-class Git support and by default you retain fine control over it.

You can look at current changes and Git history from the status bar, create new commits and push them directly without ever leaving the app.

[![](https://substackcdn.com/image/fetch/$s_!nlOg!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad4adf09-7053-4ba1-8875-24402eec93ec_2552x1014.png)](<https://substackcdn.com/image/fetch/$s_!nlOg!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad4adf09-7053-4ba1-8875-24402eec93ec_2552x1014.png>)

But if you don’t want to manage this manually, and want to use Git as a simple automatic sync layer, Tolaria also has an opt-in **AutoGit mode** in which it automatically creates commits and pushes changes after some time. It does so when the app gets idle, when you shift which app is in focus, and based on various heuristics.

* * *

One of Tolaria’s principles is being keyboard-first. Almost everything has shortcuts.

You can discover shortcuts from the mac menu and from tooltips on buttons.

A lot of actions also have a fall back or a quick way to do them via the command palette, which you can open with `cmd+K`

You can really do almost everything with it, including navigating to sections, creating new notes of a certain type, or perform routine actions.

You don’t even need to find the exact keywords — the palette is smart enough to match a lot of commands semantically:

[![](https://substackcdn.com/image/fetch/$s_!qpNL!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F403650bf-7255-4930-a808-3f390f3c4449_1262x1080.png)](<https://substackcdn.com/image/fetch/$s_!qpNL!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F403650bf-7255-4930-a808-3f390f3c4449_1262x1080.png>)

* * *

I will use this repo as a **living artifact** of how I do AI coding, for you to inspect at any time.

I have written exactly zero lines of code, out of the ~100K, and read very few of them. I am neither proud nor ashamed by it: it is what it is, and I would have never been able to build it otherwise.

Some interesting things that I haven’t seen too much elsewhere:

  * **The[Architecture](<https://github.com/refactoringhq/tolaria/blob/main/docs/ARCHITECTURE.md>), [Abstractions](<https://github.com/refactoringhq/tolaria/blob/main/docs/ABSTRACTIONS.md>), and [Getting Started](<https://github.com/refactoringhq/tolaria/blob/main/docs/GETTING-STARTED.md>) docs** — they have some overlap, but overall I feel they do a good job at capturing what the tech is about.

  * **The[collection of ADRs](<https://github.com/refactoringhq/tolaria/tree/main/docs/adr>)** — this is super useful, both for human review, and for AI to pick up on past decisions and what exists.

  * **The[Vision](<https://github.com/refactoringhq/tolaria/blob/main/docs/VISION.md>) doc** — this is not super updated, but it is still useful to guide AI when we brainstorm new features.

Overall, this is a lot of context for the AI to inspect when you want it to do some “creative” task, like creating specs for new features, or making non-trivial tech choices, and dramatically increases the chances for it to get things right.

As of today I still review the ADRs and the changes to the main docs, but I find that AI gets these right >90% of the time.

* * *

If you download and install Tolaria, you will get the option of **cloning a getting started vault** that has examples and instructions. There is also a `Feedback` button in the status bar (bottom right) that gets you to Github issues, if you want to report anything.

Also feel free to reply to this email if you have any questions or just to let me know your thoughts! Please do! It’s been a ton of work and I absolutely want to know what you think about it 😄

* * *

And that’s it for today! I wish you a great week

Sincerely 👋  
Luca

[![Scott Sterling's avatar](https://substackcdn.com/image/fetch/$s_!xD-I!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F29ae6bde-8673-4137-a0c3-ae1b8e8847b5_1024x1024.webp)](<https://substack.com/profile/232392321-scott-sterling>)[![Manik's avatar](https://substackcdn.com/image/fetch/$s_!3WBc!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74a10d8b-1420-4233-9192-11619bdd0d87_144x144.png)](<https://substack.com/profile/280077696-manik>)[![sanjay's avatar](https://substackcdn.com/image/fetch/$s_!JbK2!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16ecccd4-554c-46e7-aa5b-eed1ba546748_144x144.png)](<https://substack.com/profile/26755063-sanjay>)[![Dami's avatar](https://substackcdn.com/image/fetch/$s_!om2y!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb1648904-ee7d-4186-92a1-0504bea2d995_1203x398.png)](<https://substack.com/profile/257802758-dami>)[![Tony Young's avatar](https://substackcdn.com/image/fetch/$s_!ShuT!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F35bdcc5e-1fd8-4b2d-8314-59241717f6d2_1024x1024.jpeg)](<https://substack.com/profile/4217554-tony-young>)

79 Likes∙

[6 Restacks](<https://substack.com/note/p-194609000/restacks?utm_source=substack&utm_content=facepile-restacks>)
