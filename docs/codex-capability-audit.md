# Codex capability audit

Audit date: 2026-07-30  
Environment: Windows, Asia/Jakarta  
Workspace: `C:\Users\salukha hiola\Downloads\houseadel-main`

## Executive finding

The machine is sufficient for a browser-based Phase 1 lab after a focused setup pass. Node, npm, Git, Edge, VS Code, web research, OpenAI image generation, Canva, and Figma capabilities were present. The workspace was not a Git repository and contained only a nested legacy static site. Python, Playwright browser tooling, and FFmpeg were added deliberately; GitHub integration, deployment configuration, and ImageMagick remain absent because they are not required for local Phase 1.

The setup should stay narrow:

- install Python because the official Codex skill utilities require it;
- install the official OpenAI Playwright skill plus project-local Playwright packages and browsers;
- install FFmpeg for repeatable video/prototype inspection;
- use Sharp as the project raster pipeline and keep glTF optimization behind an optional external-tool gate;
- defer host-specific deployment skills until a host is selected;
- defer Figma production workflow until Figma is actually part of the approved process;
- do not install a generic “frontend design” skill: no official skill of that name is currently present in OpenAI's curated catalog, and House Adel's project skills provide more relevant guardrails.

## Machine and repository

| Capability | Observed state | Implication |
|---|---|---|
| Operating system | Windows | Use PowerShell-safe scripts and test Edge directly |
| Node.js | `v24.16.0` | Suitable for current Vite and tooling; set project floor lower for portability |
| npm | `12.0.1` | Use `npm.cmd` on this machine because PowerShell script execution blocks `npm.ps1` |
| Other JS package managers | pnpm, Yarn, Bun absent | Use npm; avoid adding another package manager without a measured benefit |
| Git | `2.54.0.windows.1` | Available; repository initialization required |
| Git repository | Absent at first inspection | Initialize at workspace root after preserving legacy files |
| Browser | Edge `148.0.3967.96` | Usable system-browser baseline |
| Playwright | Package and browser cache absent at first inspection | Project package and browser set installed/configured during setup |
| GPU | Intel UHD Graphics, 1 GB reported adapter memory | Good constraint target for quality-tier and DPR testing |
| Python | `3.13.14`, installed during setup | Runs official skill-creator/installer helper scripts |
| FFmpeg | `8.1.2`, Gyan full build, installed during setup | Supports video transcodes, poster extraction, and prototype analysis |
| ImageMagick | Absent | Not initially required; Sharp covers the planned raster pipeline |
| GitHub CLI | Absent | Useful after a remote exists; plugin/CLI connection should not block local Phase 1 |
| Hosting config | No `.openai/hosting.json` | No existing deployment project to reuse; do not select a host yet |
| Existing application | Four static legacy files | Preserved under `references/legacy-v0/`; not an approved direction |

## Installed Codex capabilities

| Name | Source / maintainer | Purpose | Overlap | Security and maintenance | Installed | Decision |
|---|---|---|---|---|---:|---|
| imagegen | OpenAI system skill | Generate/edit raster reference and prototype imagery | Some overlap with Canva image workflows | Sends prompts/assets to an external generation service; official, maintained | Yes | Keep; use for approved prototype/master-frame candidates with provenance |
| skill-creator | OpenAI system skill | Scaffold and validate modular skills | None | Local file writes and optional scripts; official, maintained | Yes | Required for the ten House Adel skills |
| skill-installer | OpenAI system skill | List/install official or repository skills | None | Downloads code from GitHub; inspect source and pin provenance | Yes | Use only for selected official skills |
| openai-docs | OpenAI system skill | Current OpenAI product documentation | Narrow overlap with web research | Read-only official sources; maintained | Yes | Keep; only needed for OpenAI product questions |
| OpenAI developer-docs MCP | OpenAI official endpoint | Current OpenAI developer documentation | Complements the openai-docs skill | Read-only external documentation requests | Yes | Added to Codex configuration; available after runtime reload |
| Canva plugin | Canva / OpenAI curated integration | Create and review Canva designs | Overlaps with Figma for some layout work | External account/data access; connection scopes apply | Yes | Keep available, but not part of Phase 1 implementation |
| Figma plugin and skills | Figma / OpenAI curated integration | Figma read/write and design-to-code workflows | Overlaps with Canva and code-native prototyping | External account/file access; broad write capability when invoked | Yes | Keep installed; defer use until a Figma workflow is chosen |
| Web research | OpenAI runtime | Current primary-source research and evidence capture | None | Sends queries/URLs externally; avoid confidential material | Yes | Required |
| Sites deployment capability | OpenAI runtime, discovered capability | Save and deploy websites | Overlaps with vendor deployment skills | Every deployment URL is production; requires deliberate use | Available | Do not invoke until a host/deployment decision is approved |

## Candidate skills and tools

| Name | Source / maintainer | Purpose | Overlap | Security implications | Maintenance signal | Installed | Decision |
|---|---|---|---|---|---|---:|---|
| playwright | `openai/skills`, OpenAI curated | Browser automation workflow | Project Playwright package supplies runtime, not agent procedure | Executes arbitrary browser actions against sites; keep tests local | Present in live curated catalog | Yes | Installed; available to Codex from the next turn |
| playwright-interactive | `openai/skills`, OpenAI curated | Long-lived exploratory browser session | High overlap with Playwright workflow | Same browser/data exposure with more mutable session state | Present in live curated catalog | No | Defer; ordinary Playwright plus local browser inspection is sufficient initially |
| screenshot | `openai/skills`, OpenAI curated | Capture operating-system screenshots | Browser screenshots cover current need | Can capture unrelated desktop content | Present in live curated catalog | No | Reject for Phase 1 |
| security-best-practices | `openai/skills`, OpenAI curated | Security review guidance | General Codex review capability | Read-oriented; low risk | Present in live curated catalog | No | Defer until production or data collection is introduced |
| cloudflare-deploy | `openai/skills`, OpenAI curated | Deploy to Cloudflare | Overlaps with Netlify, Vercel, Sites | External writes and credentials | Present in live curated catalog | No | Defer until host selection |
| netlify-deploy | `openai/skills`, OpenAI curated | Deploy to Netlify | Overlaps with Cloudflare, Vercel, Sites | External writes and credentials | Present in live curated catalog | No | Defer until host selection |
| vercel-deploy | `openai/skills`, OpenAI curated | Deploy to Vercel | Overlaps with Cloudflare, Netlify, Sites | External writes and credentials | Present in live curated catalog | No | Defer until host selection |
| GitHub plugin | GitHub / OpenAI curated remote | Repository, issue, and workflow operations | Overlaps partly with Git and future `gh` CLI | Grants external repository access and may write to remotes | Listed as available but not installed | No | Useful after remote selection; do not block local work or connect without an actual repository target |
| Generic frontend-design skill | No matching official curated skill found | General visual implementation | Would overlap heavily with project rules | Unknown if sourced elsewhere | Not in inspected official catalog | No | Reject; do not install an unverified substitute |
| House Adel skills | Project-authored, version controlled | Domain workflow and guardrails | Designed to be modular and nonduplicative | Local instruction files; review in Git | Maintained with repository | Yes | Ten modular skills created and structurally validated |

## MCP and integration surface

Observed from the active runtime and local plugin manifests:

- Canva app tools;
- Figma app/MCP tools and Figma workflow skills;
- Codex document-control capability for already-connected document sessions;
- OpenAI Sites deployment capability;
- OpenAI image generation;
- web research;
- local shell and image inspection.

No GitHub, analytics, CMS, storage, or deployment account is configured in the repository. No production credentials were found or requested. The global Codex configuration now includes the official read-only `openaiDeveloperDocs` MCP endpoint at `https://developers.openai.com/mcp`; it is unrelated to the application runtime.

## Package and framework policy

- Use npm and commit one lockfile.
- Install dependencies locally, never globally unless they are operating-system utilities with a clear need.
- Pin exact project dependency versions through the lockfile.
- Use one renderer, one complex motion coordinator, and one browser-testing stack.
- Record every package purpose and reject overlapping animation, smooth-scroll, cursor, shader, and component-library packages.
- Run `npm audit --omit=optional` after dependency changes; the final Phase 1 dependency graph reports zero known vulnerabilities.
- Do not carry an architecture package merely to illustrate a future recommendation. React Router trials were removed after high-severity audit findings, and the glTF Transform CLI was removed because its transitive findings were not justified before model work exists.

## Installation record

This table is updated after setup commands run.

| Item | Version | Source | Result | Reason |
|---|---:|---|---|---|
| Python | `3.13.14` | Python Software Foundation via WinGet | Installed | Run official Codex skill utilities |
| OpenAI Playwright skill | Live `main` catalog version on 2026-07-30 | `openai/skills` curated catalog | Installed to the user Codex skill directory | Consistent browser-testing workflow |
| Playwright project package | `1.62.0` | Microsoft npm package | Installed and configured | Automated browser, visual, responsive, history, and accessibility tests |
| Playwright browsers | Chromium/Firefox/WebKit current for Playwright `1.62.0` | Microsoft Playwright browser cache | Installed during verification | Cross-engine and emulated-device coverage |
| FFmpeg | `8.1.2` | Gyan full static build via WinGet; FFmpeg project | Installed | Asset transcodes and poster extraction |
| Sharp | `0.35.3` | npm | Installed locally | Responsive AVIF/WebP exports and metadata inspection |
| React Three Fiber | `9.6.1` | pmndrs npm package | Installed locally for isolated WebGL evidence | Compare React-owned scene modules without selecting the final renderer |
| Three.js | `0.185.1` | Three.js npm package | Installed locally | Rendering base for isolated WebGL prototypes |
| GSAP | `3.15.0` | GreenSock npm package | Installed locally | One complex animation coordinator |

## Dependency decisions made during setup

| Candidate | Trial result | Final status |
| --- | --- | --- |
| React Router Framework Mode package | Strong documented architectural fit, but current and alternate recent 7.x trials produced high-severity npm audit findings | Removed; architecture remains security-gated |
| `@gltf-transform/cli` | Useful model pipeline, but unnecessary before a model is approved and added audit exposure | Removed; scripts detect an optional external CLI instead |
| Lenis and other smooth-scroll packages | No Phase 1 experience requires a second scrolling runtime | Not installed |
| Additional animation libraries | Overlap with GSAP and CSS | Not installed |
| ImageMagick | Overlaps with current Sharp raster needs | Not installed |

Final command result on 2026-07-30: `npm audit --omit=optional` — **0 vulnerabilities** across the installed dependency graph.

## Sources

- OpenAI curated skill catalog API: <https://api.github.com/repos/openai/skills/contents/skills/.curated> (accessed 2026-07-30)
- OpenAI skills repository: <https://github.com/openai/skills> (accessed 2026-07-30)
- Local Codex configuration and plugin manifests (inspected 2026-07-30)
- Local tool version commands and Windows device inventory (inspected 2026-07-30)
