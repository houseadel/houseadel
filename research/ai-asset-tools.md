# AI and production tool research

**Status:** Phase 1 tool research; no provider, subscription, model, or asset is approved for production  
**Sources accessed:** 2026-07-30  
**Pricing currency:** USD unless a source states otherwise

## Important limits

Capabilities, model names, prices, plan entitlements, data use, and terms change quickly. The links and signals below were checked on the access date; they must be checked again for the exact account, model, plan, and client use when an asset is generated.

This document is operational research, not legal advice. A provider saying that a customer “owns” or may commercially use an output does not guarantee:

- that the output is copyrightable in a relevant jurisdiction;
- exclusivity or uniqueness;
- non-infringement of copyright, trademark, design, privacy, publicity, or other rights;
- clearance of an uploaded reference;
- suitability for client transfer or standalone resale; or
- indemnification.

Record the actual plan, model/version, date, terms URL, prompt, inputs, seed/job ID, output, and human approval for every candidate. See [Asset rights and provenance](../docs/asset-rights-and-provenance.md).

## Reading key

- **Evidence** is supported by linked official documentation or terms.
- **Provider claim** is a vendor's qualitative capability claim, not an independent benchmark.
- **Inference** is a production deduction that House Adel must test.
- **Recommendation** is provisional and does not approve an asset world.

## Provisional pipeline shortlist

| Need | Leading evaluation path | Conditional alternative | Do not assume |
| --- | --- | --- | --- |
| Master-frame and raster edits | OpenAI Image API against the current production GPT Image model; human composite in Photoshop | Firefly for Adobe-native/client-sensitive workflows; FLUX API for multi-reference trials | One prompt will produce a coherent asset family |
| Manual look exploration | Midjourney, if public/Stealth and rights conditions are acceptable | Firefly/FLUX playground | Midjourney can be an automated pipeline; its current terms prohibit automated generation access |
| Vector/graphic assets | Recraft paid/API, then inspect and edit SVG | Human-authored Illustrator/Figma/SVG | Generated vectors are clean, accessible, or brand-safe without review |
| Image-to-video / short motion | Runway API evaluation from an approved master frame | Firefly or Midjourney video test | A generated shot is a seamless, compression-ready loop |
| Segmentation / alpha | Photoshop manual refinement; SAM 2 as a local mask assistant | Provider background-removal endpoint | Glass, hair, fabric, translucency, and motion edges are one-click tasks |
| Depth estimate | Manual depth paint plus Depth Anything V2 **Small** experiment | Provider depth endpoint with verified license | Monocular depth equals geometry |
| Image-to-3D | Meshy and Tripo one-asset benchmark, followed by Blender cleanup | Commissioned specialist | Generated topology/textures are production-ready |
| Sound effects / ambience | ElevenLabs paid/API trial, then edit and encode | Licensed library or commissioned sound designer | Generated sound may be resold standalone or autoplayed |
| Upscaling | First use ordinary resampling from a sufficiently large master; compare Firefly precise/Recraft crisp only where necessary | Runway/Magnific or other generative upscaler after rights review | A generative upscale preserves factual/detail identity |
| Orchestration | Repository job records + provider APIs + manifest scripts | ComfyUI after a repeatable local workflow justifies its operational cost | A node graph makes model outputs deterministic |
| Web optimization | Sharp, FFmpeg, glTF Transform, Meshopt; KTX2 after tests | Draco when it wins a measured model comparison | The creative provider's download is a web-ready asset |

## Selection rule

Keep the active provider set small:

1. one leading programmable raster generator/editor;
2. one optional manual look-development tool;
3. Recraft only when vectors/graphic systems are needed;
4. one video provider;
5. at most one 3D generator after a direct benchmark;
6. one audio source plus a licensed-library fallback; and
7. deterministic local finishing tools.

Do not subscribe to every provider before an approved world requires it.

# Image generation and editing

## OpenAI image generation — leading programmable raster trial

**Purpose and best use**

- Text-to-image, multi-image generation/editing, masked edits, and iterative image workflows.
- Strong fit for scripted master-frame tests, controlled variations, object/plate generation, and asset job manifests.
- The current official guide describes the Image API for one-shot generation/editing and the Responses API for multi-turn image editing ([OpenAI, Image generation guide](https://developers.openai.com/api/docs/guides/image-generation)).

**Consistency controls**

- Reuse approved images as inputs; edit the accepted master rather than independently regenerating every shot.
- Lock model name, size, quality, prompt packet, input order, and masks.
- The current guide warns that recurring characters/brand elements and precise structured composition can still vary. A mask guides an edit but may not be followed with pixel-exact shape.

**Automation and formats**

- Official API and SDKs; both synchronous jobs and partial-image streaming are documented.
- The current Image API returns base64 data as PNG by default and can request JPEG or WebP; JPEG/WebP expose output compression.
- The current guide allows many dimensions for `gpt-image-2` within documented bounds and notes that transparent background is **not** supported by that model. Do not build the alpha pipeline around an older model capability.
- Save request IDs/job metadata and the untouched decoded output before compositing.

**Limitations**

- Nondeterministic visual result; prompts/seeds do not guarantee exact replay.
- Latency, moderation blocks, recurring-subject drift, text placement, and composition precision remain documented limitations.
- Image inputs increase cost; the current highest-resolution modes are not automatically the best source for every shot.

**Pricing signal**

- Usage-based image/text tokens. The live guide's comparison examples on 2026-07-30 put `gpt-image-2` at roughly **$0.006 / $0.053 / $0.211** for low/medium/high 1024-square output before relevant input costs; other dimensions and models differ. Recheck the live calculator and [model pricing](https://developers.openai.com/api/docs/guides/image-generation#cost-and-latency) before a batch.

**Commercial/data caveat**

- The current OpenAI Services Agreement says that, as between the customer and OpenAI and to the extent allowed by law, the customer retains input rights and owns output; output may not be unique and the customer remains responsible for inputs and use ([OpenAI Services Agreement](https://cdn.openai.com/osa/openai-services-agreement.pdf)).
- OpenAI states API/business inputs and outputs are not used to train models by default unless an organization opts in ([OpenAI, data-use policy](https://openai.com/policies/how-your-data-is-used-to-improve-model-performance/)).
- Verify which agreement governs the actual account; consumer ChatGPT terms and API/business terms are not interchangeable.

**Pipeline position:** first programmable raster benchmark; selected outputs still pass through Photoshop, provenance, rights, mobile/static adaptation, and deterministic encoding.

## Midjourney — manual look-development tool, not automation backbone

**Purpose and best use**

- Fast visual-territory exploration, master-frame candidates, style/mood studies, and optional short image-to-video exploration.
- Style References can influence color, medium, texture, and lighting; current versions also expose reference/version controls ([Midjourney, Style Reference](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference)).

**Consistency controls**

- Reuse style references/codes, model version, style-reference version, prompt, and weight.
- Use an approved result as an image/start-frame reference.
- The official docs note that reference algorithms and older codes can behave differently across model versions; record all version controls.

**Automation and formats**

- Web/Discord workflow. The current Terms expressly prohibit automated tools from accessing, interacting with, or generating assets through the service ([Midjourney Terms, effective 2026-05-27](https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service)).
- Therefore, no scraping, browser automation, unofficial bot, or invented “Midjourney API” belongs in the House Adel pipeline.
- Images are downloadable raster assets; the editor can export a transparent PNG for erased areas. Current video downloads are MP4, with GIF also available ([Midjourney, Editor](https://docs.midjourney.com/hc/en-us/articles/32764383466893-Editor), [Video](https://docs.midjourney.com/hc/en-us/articles/37460773864589-Video)).

**Limitations**

- Manual job capture, model behavior changes, public/remix default, no sanctioned automation, and no deterministic replay.
- Style reference is an influence, not a rights-cleared style license or identity lock.
- Generated video is currently a short start-frame workflow; high motion can introduce unrealistic/glitchy motion according to the official guide.

**Pricing signal**

- Current monthly plan list: Basic **$10**, Standard **$30**, Pro **$60**, Mega **$120**; annual rates and GPU allowances differ. Stealth is limited to Pro/Mega. Plans and entitlements can change ([Midjourney, Comparing Plans](https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans)).

**Commercial/privacy caveat**

- Current terms say users own created assets to the fullest extent possible under law, subject to third-party rights and other exceptions. Companies over **$1 million annual gross revenue** need Pro or Mega for the stated ownership/commercial condition.
- Users grant Midjourney a broad, perpetual license to inputs and outputs. Assets are public/remixable by default; Stealth is a best-efforts feature and assets made in shared/open spaces remain visible.
- See [Midjourney commercial guide](https://docs.midjourney.com/hc/en-us/articles/27870375276557-Using-Images-Videos-Commercially) and the controlling [Terms](https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service).

**Pipeline position:** optional manual ideation lane. Download immediately, record job/model/plan, and reproduce the chosen direction through a controlled master/composite workflow.

## Adobe Firefly — Adobe-native, rights-sensitive production candidate

**Purpose and best use**

- Generate, fill, expand, composite, reference-guided generation, and precise upscaling inside an Adobe-oriented finishing workflow.
- Particularly relevant when a client already uses Creative Cloud/enterprise controls or when Photoshop finishing is central.

**Consistency controls**

- Style and Structure References with adjustable influence are documented in the API; qualifying enterprise offerings also document custom subject/style models ([Adobe, Style Reference Images](https://developer.adobe.com/firefly-services/docs/firefly-api/guides/concepts/style-image-reference/), [Custom Models](https://developer.adobe.com/firefly-services/docs/firefly-api/guides/concepts/custom-models/)).
- Lock API version/model, reference IDs, strengths, style presets, seed where returned, and the post-generation Photoshop recipe.

**Automation and formats**

- Official asynchronous APIs for image generation, fill/expand and related services ([Firefly API quickstart](https://developer.adobe.com/firefly-services/docs/firefly-api/guides/)).
- Firefly input upload documentation supports JPEG, PNG, and WebP in relevant endpoints. Responses use temporary result URLs; copy them into controlled storage.
- API versions change: Adobe's current changelog documents the 2026 precise-upscaler change, and the Image 5 migration guide describes breaking request-schema changes ([Firefly API changelog](https://developer.adobe.com/firefly-services/docs/firefly-api/getting-started/changelog/), [Image 5 migration](https://developer.adobe.com/firefly-services/docs/firefly-api/guides/how-tos/cm-generate-image/breaking-changes)).

**Limitations**

- API access/credentials can depend on enterprise entitlement.
- Default API rate limits are currently 4 requests/minute and 9,000/day unless changed by Adobe; batch orchestration needs retry/backoff ([Adobe, technical usage notes](https://developer.adobe.com/firefly-services/docs/firefly-api/getting-started/usage-notes/)).
- Model/surface/partner-model status matters. Do not assume every model exposed in Firefly has the same training basis, indemnity, or terms.
- Content Credentials may be applied to exported Firefly-involved content.

**Pricing signal**

- Consumer/Creative Cloud access uses subscriptions and generative credits; standard and premium operations consume credits differently. Enterprise API access is entitlement/operations based. Consult [Adobe generative-credit access](https://helpx.adobe.com/creative-cloud/apps/generative-ai/generative-credits-access-and-use.html) and current plan/enterprise quote before estimating.

**Commercial-rights caveat**

- Adobe's FAQ says outputs from non-beta Firefly features may be used commercially; current beta treatment and any in-product exception must be checked ([Adobe, Generative credits FAQ](https://helpx.adobe.com/creative-cloud/apps/generative-ai/generative-credits-faq.html)).
- Eligibility for Adobe's Firefly IP indemnification is narrower than “commercial use”: it depends on qualifying customer agreements, named eligible features/surfaces/export events, and excludes specified third-party-model and beta/trial scenarios ([Adobe Firefly product description](https://helpx.adobe.com/legal/product-descriptions/adobe-firefly.html), [Adobe Generative AI Product Specific Terms](https://www.adobe.com/cc-shared/assets/pdf/legal/servicetou/adobe-generative-ai-product-specific-terms-en-us-20260423.pdf)).
- “Commercially usable” does not mean risk-free; clear all inputs and confirm the exact feature/model.

**Pipeline position:** conditional alternative/companion to OpenAI for image creation, and strong finishing path through Photoshop. Run the same master-frame brief through both before choosing.

## Recraft — leading vector and graphic-asset candidate

**Purpose and best use**

- Raster and vector generation, inpainting, background operations, vectorization, background removal, and upscaling.
- Best candidate here for icon families, graphic illustration, emblems, shape systems, and SVG starting points—not for final House Adel wordmarks without human drawing.

**Consistency controls**

- Curated styles and user/API style IDs are documented for V2/V3.
- Current docs explicitly say V4/V4.1 models do **not** support the style feature; custom API styles are compatible with V3 raster/vector. Select model and style together rather than assuming the newest model supports every control ([Recraft, Styles](https://www.recraft.ai/docs/api-reference/styles)).
- Recraft states it has no dedicated character-tracking feature; prompts, frames, styles, and references are the workaround ([Recraft, Character consistency](https://www.recraft.ai/docs/best-practices/character-consistency)).

**Automation and formats**

- Official REST API, including generation and editing endpoints ([Recraft, Endpoints](https://www.recraft.ai/docs/api-reference/endpoints)).
- Raster styles output PNG, WebP, or JPG; vector/icon styles output SVG according to the style documentation.
- API can return result URLs or base64 JSON. Download and validate every SVG for groups, paths, masks, clipping, text outlines, IDs, and accessibility.

**Limitations**

- Feature/model incompatibilities require careful pinning.
- Generated SVG may be unnecessarily complex or visually inconsistent at small sizes.
- “Character consistency” remains approximate.
- Free-plan privacy/rights are unsuitable for proprietary client exploration.

**Pricing signal**

- API units currently cost **$1 per 1,000 units**. Examples on 2026-07-30: V4 raster **$0.04/image**, V4 Pro raster **$0.25**, V4 vector **$0.08**, V4 Pro vector **$0.30**, background removal **$0.01**, crisp upscale **$0.004**. Recheck [Recraft API pricing](https://www.recraft.ai/docs/api-reference/pricing).

**Commercial/privacy caveat**

- Recraft's current plan page states that free-plan images are Recraft-owned, public, and not licensed for commercial use; paid-plan images are private and user-owned with commercial rights ([Recraft pricing](https://www.recraft.ai/pricing)).
- The controlling terms govern inputs, outputs, API use, storage and any training/opt-out settings; save the version used ([Recraft Terms, updated 2026-03-23](https://www.recraft.ai/legal/terms)).

**Pipeline position:** conditional specialist for graphic/vector worlds and utility transforms; not a general replacement for Photoshop or a human vector pass.

## Black Forest Labs FLUX — flexible API/local image family, license per checkpoint

**Purpose and best use**

- Text-to-image, editing, fill/outpaint, flexible aspect ratios, multi-reference composition, and optional self-hosting for certain weights.
- Useful comparison for image families that need several reference elements or a controlled local workflow.

**Consistency controls**

- Current FLUX.2 documentation exposes multi-reference editing (model-dependent limits), exact dimensions, pose/control features, and JSON parameters.
- **Provider claim:** BFL advertises improved identity, color, typography, and multi-reference consistency. Treat those as benchmark hypotheses, not production facts ([BFL, FLUX.2](https://bfl.ai/models/flux-2), [multi-reference guide](https://help.bfl.ai/articles/6546682167-what-is-multi-reference-editing)).
- Pin the exact endpoint/checkpoint, references, dimensions, steps/guidance where available, and local inference environment.

**Automation and formats**

- Official asynchronous API and open weights for selected variants. Current FLUX.2 supports dimensions in multiples of 16 up to 4 megapixels under the documented rules ([BFL, dimensions](https://help.bfl.ai/articles/8916739058-what-aspect-ratios-and-output-dimensions-are-supported)).
- Output delivery is endpoint-specific; capture returned file/content type and normalize the untouched raster into the master archive before web transforms.

**Limitations**

- “FLUX” is not one license. API service, Playground, `[klein] 4B`, `[klein] 9B`, `[dev]`, and commercial self-host licenses differ.
- Local inference requires GPU capacity, version pinning, model storage, security, and operational ownership.
- Multi-reference composition can still drift in identity, scale, lighting, and small details.

**Pricing signal**

- Current BFL pricing is per image/megapixel. On 2026-07-30, examples included FLUX.2 `[klein] 4B` from **$0.014**, `[pro]` from **$0.03/MP** generation and **$0.045/MP** editing, `[flex]` **$0.05/$0.10 per MP**, and `[max]` from **$0.07/MP**. Recheck [BFL pricing](https://bfl.ai/pricing) and [cost guide](https://help.bfl.ai/articles/7986977817-what-are-the-costs-associated-with-using-your-models).

**Commercial/data caveat**

- BFL's API/developer terms say customers may use outputs commercially subject to the terms, input rights, and restrictions, and that outputs may not be unique.
- The API terms grant BFL a broad license to inputs/outputs for operating and improving services, including model training. This requires review before sending confidential client material ([FLUX API Terms](https://bfl.ai/legal/flux-api-service-terms), [Developer Terms](https://bfl.ai/legal/developer-terms-of-service)).
- Current BFL documentation identifies FLUX.2 `[klein] 4B` as Apache 2.0, while `[klein] 9B` and `[dev]` have noncommercial local restrictions unless an applicable commercial license/API path is used ([BFL model/license overview](https://help.bfl.ai/articles/7655484417-what-flux-models-are-available), [licensing overview](https://help.bfl.ai/articles/9272590838-self-serve-dev-license-overview-pricing)).

**Pipeline position:** conditional API benchmark and later local-orchestration candidate. Never record merely “FLUX”; record provider, endpoint, exact weights/version, and license.

## ComfyUI — orchestration environment, not a rights-clearing layer

**Purpose and best use**

- Node-graph orchestration for local or hosted image/video/audio/3D workflows, batching, segmentation/depth passes, model chaining, and workflow capture.
- Useful only when House Adel has a repeated graph that API scripts cannot express more simply.

**Consistency controls**

- Workflow JSON records nodes/connections and can be versioned; ComfyUI also embeds workflow metadata in compatible generated images ([ComfyUI, Workflow](https://docs.comfy.org/development/core-concepts/workflow), [Workflow JSON schema](https://docs.comfy.org/specs/workflow_json)).
- Pin every model/checkpoint hash, VAE, LoRA, custom node commit, sampler, seed, dimensions, and environment. The graph alone is incomplete provenance.

**Automation and formats**

- Local queue/API patterns and an official Cloud API exist. The Cloud API accepts API-format workflow JSON, returns asynchronous job IDs, and exposes output downloads.
- Current Cloud API docs describe it as experimental and require qualifying subscription tiers for programmatic use ([Comfy Cloud API](https://docs.comfy.org/development/cloud/overview)).
- Output formats depend entirely on nodes/models; declare them in the workflow record.

**Limitations**

- GPU/driver/model storage, dependency drift, custom-node security, and workflow maintenance can outweigh value for occasional assets.
- Community custom nodes execute code in the local environment. Audit source, pin versions, and do not import arbitrary workflows into a trusted workstation.
- Re-running identical inputs is not guaranteed byte-identical across changed dependencies/hardware.

**Pricing and rights signal**

- Core ComfyUI source is GPL-3.0 and can run locally; cloud, hardware, electricity, partner APIs, and models have separate costs ([ComfyUI repository](https://github.com/comfy-org/ComfyUI)).
- ComfyUI's software license grants no rights to a checkpoint, LoRA, input, or output. Verify every model and node service individually.

**Pipeline position:** defer until a selected world needs high-volume repeated local generation/segmentation/depth graphs. Prefer provider APIs plus repository manifests first.

# Video and image-to-video

## Runway — leading short-motion provider trial

**Purpose and best use**

- Image-to-video from an approved frame, short shot exploration, motion tests, video-to-video/editing depending on model, and selected upscaling.
- Best for testing whether a still world needs a short motion layer before committing to After Effects or specialist animation.

**Consistency controls**

- Use approved high-quality references with isolated subjects and deliberate lighting. Runway's own reference-media guide calls reference quality the largest quality lever ([Runway, Reference media](https://docs.dev.runwayml.com/recipes/reference-media/)).
- Pin model, prompt, first/last/reference frames, aspect/resolution, duration, seed where a model exposes it, and task ID.
- Finish loop timing, grading, stabilization, retouch, alpha/mattes, and audio in conventional tools.

**Automation and formats**

- Official API/SDK with text/image/video input depending on model ([Runway, Models](https://docs.dev.runwayml.com/guides/models/), [API reference](https://docs.dev.runwayml.com/api/)).
- Input docs enumerate JPEG/PNG/WebP and numerous video/audio containers/codecs. Output URLs are ephemeral and currently expire within 24–48 hours; download immediately to controlled storage ([Runway, Inputs](https://docs.dev.runwayml.com/assets/inputs/), [Outputs](https://docs.dev.runwayml.com/assets/outputs/)).
- Inspect the actual output content type/container; transcode from the archived provider output, not its expiring URL.

**Limitations**

- Temporal identity, texture, text, edge, hand/object, camera, and loop continuity artifacts.
- Fixed model-specific resolutions, ratios, durations, and automatic input cropping.
- Credits can be consumed rapidly; models and deprecated endpoints change.
- Output must be edited and encoded; it is not a web deliverable.

**Pricing signal**

- API credits are currently **$0.01 each**. Example 2026-07-30 video rates: Gen-4.5 **12 credits/second** and Gen-4 Turbo **5 credits/second**; many newer/third-party models cost differently. See the live [Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/).

**Commercial/data caveat**

- Runway states it does not claim ownership of inputs/outputs and does not restrict compliant commercial use, while output may not be unique and the user is responsible for rights ([Runway commercial-use help](https://help.runwayml.com/hc/en-us/articles/21668707517587-Can-I-use-the-content-I-made-in-Runway-for-commercial-purposes), [Terms, updated 2026-05-11](https://runwayml.com/terms-of-use)).
- Current terms include a broad provider license over content made available through the service for operation/improvement/training. Review privacy/enterprise terms before confidential client references.

**Pipeline position:** one controlled shot/loop benchmark from an approved master frame; After Effects/FFmpeg remain the finishing and delivery path.

## Firefly and Midjourney video — secondary comparisons

- Firefly currently offers text/image-to-video and API-supported output ratios, but surface/model/plan eligibility and indemnification must be checked separately ([Adobe technical usage notes](https://developer.adobe.com/firefly-services/docs/firefly-api/getting-started/usage-notes/), [Firefly product description](https://helpx.adobe.com/legal/product-descriptions/adobe-firefly.html)).
- Midjourney currently animates a start image into short MP4 output and exposes low/high motion and loop controls; its no-automation rule still applies ([Midjourney Video](https://docs.midjourney.com/hc/en-us/articles/37460773864589-Video)).
- **Recommendation:** compare either one—not both—against Runway only when its integration or visual result is materially relevant to an approved frame.

# Segmentation, alpha, depth, and upscale

## Photoshop — human finishing authority

**Purpose and best use**

- Layered compositing, selection/masking, edge repair, retouch, grade, alpha review, generative fill/expand, and master export.

**Automation/formats**

- Desktop actions/batch and Adobe APIs exist, but the layered PSD/PSB remains a human-reviewed working master.
- Photoshop API v2 documents JPEG, PNG, PSD, and TIFF output types ([Adobe, Photoshop API output migration](https://developer.adobe.com/firefly-services/docs/photoshop/guides/photoshop-v2/v1-to-v2/output-types-migration)).

**Consistency**

- Locked adjustment layers/LUT or recorded grade, named layers, non-destructive masks, approved references, and a contact sheet against the master frame.

**Limitations/cost/rights**

- Subscription software; current pricing is plan/region dependent.
- Firefly-generated layers inherit the applicable Firefly feature/plan rules. Ordinary human editing does not clear the source image's rights.
- One-click Remove Background produces a mask but still needs manual edge review ([Adobe, Remove Background](https://helpx.adobe.com/photoshop/desktop/repair-retouch/remove-objects-fill-space/remove-background-in-your-images.html)).

**Pipeline position:** required finishing/review capability when raster assets are used, even if another generator supplied the source.

## SAM 2 — local segmentation assistant

**Purpose/best use:** promptable image and video masks, useful for rough subject/region extraction and propagation.

**Automation/formats:** Python model/API workflow; outputs are masks/arrays that House Adel should archive as lossless grayscale PNG or another explicitly chosen working format.

**Consistency/limits:** pin checkpoint/code commit and prompt points/boxes; inspect fine hair, translucency, reflections, holes, and frame-to-frame edges. It segments; it does not understand final compositing intent.

**Cost/rights:** local compute. Meta's official repository publishes SAM 2 code and model checkpoints under Apache 2.0; input/output rights remain House Adel's responsibility ([Meta, SAM 2](https://github.com/facebookresearch/sam2)).

**Pipeline position:** optional pre-mask; Photoshop/manual review remains the approval boundary.

## Depth Anything V2 — research-only depth assistant until model is pinned

**Purpose/best use:** monocular relative-depth estimate for restrained 2.5D tests, masks, or camera planning.

**Automation/formats:** local Python inference; save original numerical result plus a documented normalized visual map rather than only an 8-bit preview.

**Consistency/limits:** pin weights/commit/preprocessing. Depth is relative and can fail on transparent/reflective/thin/ambiguous forms; it is not geometry or camera calibration.

**Cost/rights:** local compute. The official repository lists **Small** under Apache-2.0 and **Base/Large/Giant** under CC-BY-NC-4.0. Only Small may enter a commercial evaluation without another license; keep all noncommercial weights out of client assets ([Depth Anything V2](https://github.com/DepthAnything/Depth-Anything-V2)).

**Pipeline position:** optional prototype aid, never an unreviewed production truth.

## Upscaling rule

First ask whether a larger source can be generated/obtained. Use deterministic Sharp/Photoshop resampling when it retains approved detail. A generative upscaler invents information and must be treated as a new generated asset with new provenance.

Current candidates:

- Adobe Firefly **Precise Upscaler** API (the current changelog records its 2026 GA rename);
- Recraft Crisp Upscale for inexpensive cleanup and Creative Upscale for generative change; and
- Runway's current Magnific-backed upscale endpoints.

Compare crops at final display size; reject invented logos, text, faces, fabric, architecture, or product details.

# Image-to-3D and text-to-3D

## Meshy — leading first benchmark for blockouts/secondary props

**Purpose and best use**

- Text/image-to-3D, texturing, remesh, rig/animation features.
- Best considered for blockouts, background props, and fast dimensional feasibility—not signature hero geometry without specialist review.

**Consistency controls**

- Use one approved multi-view/reference packet, record model/version and task IDs, and regenerate as a family.
- Consistency is subordinate to Blender cleanup; repeated prompts do not guarantee matching topology/UVs.

**Automation and formats**

- Official text-to-3D and image-to-3D APIs ([Meshy, Image to 3D](https://docs.meshy.ai/en/api/image-to-3d), [Text to 3D](https://docs.meshy.ai/en/api/text-to-3d)).
- Web exports include GLB, FBX, OBJ, STL, USDZ, and 3MF according to the official guide ([Meshy, Export formats](https://docs.meshy.ai/en/webapp/guides/platform/export-formats)).

**Limitations**

- Silhouette errors, hidden geometry, topology, UV seams, texture bake, scale/pivot, material count, likeness, and prompt-derived IP need review.
- A supported GLB is not an optimized web GLB.

**Pricing and rights**

- Current docs show Free with 100 monthly credits; Meshy 6 text/image-to-3D currently consumes 20 credits and texturing 10, with plan pricing subject to change.
- Free-plan outputs are CC BY 4.0; paid plans include private/commercial-use rights and user output ownership per Meshy's documentation ([Meshy, Pricing & Credits](https://docs.meshy.ai/en/webapp/pricing)).
- Verify whether the intended client transfer or raw-model distribution is covered and clear reference rights.

**Pipeline position:** benchmark candidate -> Blender cleanup -> glTF Transform/Meshopt/KTX test -> static poster.

## Tripo — alternate benchmark, not a simultaneous default

**Purpose and best use**

- Text/image/multiview-to-model, model post-processing, texture, rig/animation, and configurable geometry/format operations.
- Useful as the comparator if Meshy fails silhouette/topology on the approved sample.

**Consistency controls**

- Pin the dated `model_version`, input/multiview set, task ID, texture/geometry quality, face limit, and seed if that exact model exposes it.
- Current API supports low-poly/quad/parts and Meshopt-related options only in specific model/parameter combinations; record them rather than assuming.

**Automation and formats**

- Official asynchronous API ([Tripo, Generation](https://platform.tripo3d.ai/docs/generation)).
- Current schema includes conversion to GLTF/GLB pathways, USDZ, FBX, OBJ, STL, and 3MF, with feature-dependent restrictions ([Tripo OpenAPI schema](https://platform.tripo3d.ai/docs/schema), [Post-process](https://platform.tripo3d.ai/docs/post-process)).

**Limitations**

- Same production risks as Meshy; model-version/parameter compatibility is complex.
- Provider-generated “quad,” “low poly,” or compressed output still needs Blender and browser inspection.

**Pricing and rights**

- Credit-based. Current P1 examples: text-to-3D **30 credits untextured / 40 standard texture**; image-to-3D **40 / 50**, with add-ons for topology, quality, parts and post-processing ([Tripo Pricing & Billing](https://platform.tripo3d.ai/docs/billing)).
- Tripo's own 2026 licensing guide says paid users generally receive broad commercial/distribution rights under its then-current terms, while free inputs/outputs carry broader provider rights. This is a **provider summary**, not the controlling contract; verify the actual [Tripo terms](https://www.tripo3d.ai/terms) and account plan for the job ([Tripo licensing guide](https://www.tripo3d.ai/blog/are-ai-3d-models-royalty-free)).

**Pipeline position:** alternate one-asset benchmark; choose Meshy or Tripo for a given production lane, then finish in Blender.

# Sound effects and ambience

## ElevenLabs Sound Effects — conditional audio candidate

**Purpose and best use**

- Short interface cues, transitions, environmental ambience, texture beds, and promptable loops.
- Appropriate only after a world brief defines why sound exists and how silence works.

**Consistency controls**

- Reuse model ID, precise acoustic vocabulary, duration, loop flag, and prompt-influence setting.
- Generate families, then choose/edit/grade loudness in an audio editor/FFmpeg. Record the raw file and prompt.

**Automation and formats**

- Official `POST /v1/sound-generation` endpoint. The current API exposes model, `loop`, duration up to 30 seconds, prompt influence, and selectable codec/sample-rate/bitrate output ([ElevenLabs API](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert)).
- Current capability docs state MP3 for effects and 48 kHz WAV for non-looping effects; API tier/format availability varies ([ElevenLabs, Sound effects](https://elevenlabs.io/docs/overview/capabilities/sound-effects)).

**Limitations**

- Generated “seamless” loops still need sample-accurate seam and speaker/headphone review.
- Short duration; ambience may need composition rather than repeating one obvious texture.
- Musical output can introduce separate music-rights/use questions; do not treat a sound-effect plan as blanket music clearance.
- The site still needs visible controls, no audible autoplay, and non-audio state equivalents.

**Pricing signal**

- Current website generation: 200 credits when duration is automatic or 40 credits/second when specified, producing multiple variants. Current API: 100 credits automatic or **11 credits/second** specified for one result; verify plan credit pricing ([ElevenLabs, sound-effect cost](https://elevenlabs.io/docs/help-center/product/content-production/sound-effects/how-much-does-it-cost-to-generate-sound-effects)).

**Commercial-rights caveat**

- ElevenLabs states paid-plan generation includes commercial rights; free output is noncommercial and requires attribution. Beta services can have separate restrictions ([ElevenLabs Billing](https://elevenlabs.io/docs/overview/administration/billing), [publishing guidance](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform)).
- The current prohibited-use policy forbids commercial exploitation/resale of Sound Effects output on a **standalone** basis (for example as isolated sound files/libraries). Integrated website use is the intended lane, subject to the full terms ([ElevenLabs Prohibited Use Policy](https://elevenlabs.io/use-policy)).

**Pipeline position:** optional approved-world source -> human edit -> lossless master -> FFmpeg web exports -> opt-in playback and static/silent equivalence.

# Conventional production and optimization tools

These tools do not remove source-asset rights obligations.

| Tool | Purpose / best use | Automation and formats | Cost / license signal | Limitation and pipeline position |
| --- | --- | --- | --- | --- |
| **Photoshop** | Raster composite, retouch, masks, alpha, grade, generated-layer review | Desktop batch/actions; Photoshop APIs; PSD/TIFF/PNG/JPEG workflows | Region/plan-dependent [Creative Cloud subscription](https://www.adobe.com/creativecloud/plans.html); Firefly terms apply only to Firefly-powered operations | Human finishing master; not deterministic enough to replace recorded export scripts |
| **After Effects** | Motion composite, mattes, loop timing, tracking, cleanup, mezzanine export | Render Queue/Media Encoder/scripts; broad documented import/export support ([Adobe formats](https://helpx.adobe.com/ca/after-effects/kb/supported-file-formats.html)) | Region/plan-dependent [Creative Cloud subscription](https://www.adobe.com/creativecloud/plans.html) | Create approved motion master; FFmpeg makes web derivatives |
| **Blender** | Mesh cleanup, UV/material, lighting, baking, rig/animation, GLB authoring | Python/CLI; GLTF/GLB import/export | Free/open-source GPL; Blender says the artwork is the user's property ([Blender license](https://docs.blender.org/manual/en/3.2/getting_started/about/license.html)) | Required approval stage for generated 3D; exporter/material limits still need tests |
| **Sharp** | Responsive still resize/format/metadata pipeline | Node API/CLI ecosystem; JPEG, PNG, WebP, AVIF, TIFF and documented combinations ([Sharp](https://sharp.pixelplumbing.com/)) | Open-source; local compute | Deterministic derivatives after visual master approval |
| **FFmpeg** | Video/audio transcode, trim, filter, poster extraction, inspection | CLI and libraries; broad codecs/containers ([FFmpeg manual](https://ffmpeg.org/ffmpeg.html)) | LGPL 2.1+ default; optional GPL components alter build; codec patent context varies ([FFmpeg Legal](https://ffmpeg.org/legal.html)) | Pin exact binary/build; internal processing and binary redistribution are different legal questions |
| **glTF Transform** | Inspect, dedup, prune, resize/convert textures, Meshopt/Draco/KTX-related GLB operations | TypeScript API and CLI ([glTF Transform](https://github.com/donmccurdy/glTF-Transform)) | MIT | Leading deterministic 3D orchestration/report step |
| **Meshoptimizer / `gltfpack`** | Mesh/index/animation optimization and Meshopt compression | CLI/library; GLTF/GLB workflows ([meshoptimizer](https://github.com/zeux/meshoptimizer), [`gltfpack`](https://github.com/zeux/meshoptimizer/blob/master/gltf/README.md)) | Open-source | Leading geometry-compression hypothesis; measure visual and decoder cost |
| **Draco** | Alternative mesh/point-cloud compression | Library/tool integration ([Google Draco](https://google.github.io/draco/)) | Open-source Apache 2.0 project | Benchmark against Meshopt on the approved asset; avoid two decoder paths without evidence |
| **KTX-Software / KTX2** | GPU texture container and Basis/transcode tooling | CLI/libraries; KTX2 ([Khronos KTX-Software](https://github.com/KhronosGroup/KTX-Software), [KTX2 spec](https://registry.khronos.org/KTX/specs/2.0/ktxspec.v2.html)) | Open-source tools | Add only after device tests show memory/transfer benefit; record encoder version/settings |

## Tool-to-pipeline map

```text
direction
  world brief + visual bible + rights plan

look development
  OpenAI / Firefly / FLUX API
  Midjourney only as optional manual lane
  Recraft for vector/graphic worlds

master finishing
  Photoshop
  SAM 2 / Depth Anything Small only as reviewed assistants

motion
  Runway test -> After Effects -> FFmpeg

optional 3D
  Meshy OR Tripo -> Blender -> glTF Transform
  -> Meshopt OR Draco -> optional KTX2 -> browser QA

optional sound
  ElevenLabs or licensed/commissioned source
  -> edit/master -> FFmpeg -> opt-in web delivery

publication
  Sharp / FFmpeg / glTF tooling
  -> hash + manifest + rights + creative + technical approval
```

## Consistency protocol

For every generated family:

1. Approve one master frame before expansion.
2. Lock the model/provider/plan and save current terms.
3. Use the approved frame and cleared subject/material references as inputs.
4. Use a shot manifest with camera, crop, light, palette, material, and negative constraints.
5. Keep a single grade/grain/color-management recipe.
6. Generate small comparative batches; do not select by surprise alone.
7. Compare each candidate beside the master and exclusion sheet.
8. Preserve raw outputs before Photoshop/After Effects/Blender changes.
9. Record human edits that materially establish authorship.
10. Create mobile, static, reduced-motion, and failed-asset variants from the same approved family.

## Tool trial scorecard

Run the same approved brief through each shortlisted provider and record:

| Criterion | Evidence |
| --- | --- |
| Direction fidelity | Blind review against master-frame criteria |
| Cross-shot consistency | Contact sheet with subject/material/light/camera deviations |
| Editability | Layer/mask/vector/geometry quality and manual repair time |
| Automation | Supported API, stable identifiers, retry/error behavior, no prohibited access |
| Cost | Successful + rejected outputs, input charges, subscriptions, human cleanup time |
| Rights/privacy | Exact terms/plan, input license, output grant, public/training defaults, client transfer |
| Formats | Original provider format, dimensions/duration, color/alpha, downstream conversion |
| Resilience | Can an approved static/mobile/fallback be produced from the same family? |
| Repeatability | Model/version/seed/workflow records and observed rerun drift |

Choose the smallest provider set that passes the world-specific trial. Visual quality without rights, repeatability, or a fallback is a failed test.

## Publication gate

No generated or AI-edited asset may enter `public/` unless:

- the provider/model/plan and terms date are recorded;
- every reference/input is cleared;
- commercial use and client-transfer status are verified;
- raw output and job metadata are preserved;
- transformations and human approvals are recorded;
- mobile/static/reduced-motion/failure variants exist where required;
- the asset has been checked for protected people, brands, artworks, product designs, and accidental text;
- compression/output hashes are in the manifest; and
- a human has approved creative, rights, and technical status separately.

## Primary official sources

### Image and orchestration

- OpenAI, Image generation guide: https://developers.openai.com/api/docs/guides/image-generation
- OpenAI Services Agreement: https://cdn.openai.com/osa/openai-services-agreement.pdf
- OpenAI, data-use policy: https://openai.com/policies/how-your-data-is-used-to-improve-model-performance/
- Midjourney Terms: https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service
- Midjourney Plans: https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans
- Midjourney Style Reference: https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference
- Adobe Firefly API: https://developer.adobe.com/firefly-services/docs/firefly-api/guides/
- Adobe Firefly API changelog: https://developer.adobe.com/firefly-services/docs/firefly-api/getting-started/changelog/
- Adobe Generative AI Product Specific Terms: https://www.adobe.com/cc-shared/assets/pdf/legal/servicetou/adobe-generative-ai-product-specific-terms-en-us-20260423.pdf
- Recraft API endpoints: https://www.recraft.ai/docs/api-reference/endpoints
- Recraft API pricing: https://www.recraft.ai/docs/api-reference/pricing
- Recraft Terms: https://www.recraft.ai/legal/terms
- Black Forest Labs FLUX.2: https://bfl.ai/models/flux-2
- Black Forest Labs pricing: https://bfl.ai/pricing
- Black Forest Labs API Terms: https://bfl.ai/legal/flux-api-service-terms
- ComfyUI repository: https://github.com/comfy-org/ComfyUI
- ComfyUI workflows: https://docs.comfy.org/development/core-concepts/workflow

### Motion, 3D, and audio

- Runway API models: https://docs.dev.runwayml.com/guides/models/
- Runway API pricing: https://docs.dev.runwayml.com/guides/pricing/
- Runway inputs: https://docs.dev.runwayml.com/assets/inputs/
- Runway outputs: https://docs.dev.runwayml.com/assets/outputs/
- Runway Terms: https://runwayml.com/terms-of-use
- Meshy pricing/licensing: https://docs.meshy.ai/en/webapp/pricing
- Meshy export formats: https://docs.meshy.ai/en/webapp/guides/platform/export-formats
- Tripo generation API: https://platform.tripo3d.ai/docs/generation
- Tripo billing: https://platform.tripo3d.ai/docs/billing
- Tripo OpenAPI schema: https://platform.tripo3d.ai/docs/schema
- ElevenLabs Sound Effects: https://elevenlabs.io/docs/overview/capabilities/sound-effects
- ElevenLabs API: https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert
- ElevenLabs Billing: https://elevenlabs.io/docs/overview/administration/billing
- ElevenLabs Prohibited Use Policy: https://elevenlabs.io/use-policy

### Production

- Adobe Photoshop generative AI overview: https://helpx.adobe.com/photoshop/desktop/generative-ai/generative-ai-features-overview.html
- Adobe Creative Cloud plans: https://www.adobe.com/creativecloud/plans.html
- Adobe After Effects supported formats: https://helpx.adobe.com/ca/after-effects/kb/supported-file-formats.html
- Blender license: https://docs.blender.org/manual/en/3.2/getting_started/about/license.html
- Blender glTF exporter: https://docs.blender.org/manual/en/3.3/addons/import_export/scene_gltf2.html
- Meta SAM 2: https://github.com/facebookresearch/sam2
- Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Sharp: https://sharp.pixelplumbing.com/
- FFmpeg: https://ffmpeg.org/ffmpeg.html
- glTF Transform: https://github.com/donmccurdy/glTF-Transform
- Meshoptimizer: https://github.com/zeux/meshoptimizer
- Draco: https://google.github.io/draco/
- Khronos KTX-Software: https://github.com/KhronosGroup/KTX-Software
