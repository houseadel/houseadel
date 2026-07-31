# Design-led studios and case-study systems

Status: comparative evidence for Phase 1.  
Access date: 2026-07-30.  
Evidence note: `Browser observation` describes the public site on the access date. `Inference` marks interpretation.

## Locomotive

**Classification:** realistic stretch peer and narrow scrolling reference.

**Business layer.** [Locomotive’s agency page](https://locomotive.ca/en/agency) describes an independent, small, nimble Montreal digital-first design agency whose founders have worked together since 2008. It lists digital strategy, content, UX, copy, art direction, web design and development, hosting, and ecommerce. The visible agency roster includes nine people in design roles alone, so the studio is larger than House Adel’s current model even if it retains independent positioning.

**Governing concept and durable value.** The studio system is the combination of strategic, design, and development craft. It does not force every project into one visual world. The durable value after the home is a [43-item work index](https://locomotive.ca/en/work) with filters and descriptive cases.

**Home, navigation, motion, rendering, and assets.** The site preserves standard routes for agency and work content. Exact current portfolio renderer, CMS, and asset pipeline are not documented in the reviewed primary sources. Locomotive’s separately published [Locomotive Scroll repository](https://github.com/locomotivemtl/locomotive-scroll) is a narrow technical artifact: version 5 is documented as a lightweight TypeScript library built on Lenis, retaining the native scrollbar and describing keyboard/ARIA support; touch parallax is disabled by default. Those claims apply to the library, not necessarily to every Locomotive project.

The official [version 5 showcase](https://scroll.locomotive.ca/) lists Locomotive, Destigmatize, Scout Motors, Lightship, Vooban, Construction Desourdy, GKC, Troa, Vazzi, 21TSI, Eduard Bodak, and Mindmarket as real projects using the library. The list spans studios, portfolios, campaigns, and product sites. Its lesson is range, not a signature aesthetic: the library does not supply the concept.

**Project presentation and production.** The [Elektra Virtual Museum case](https://locomotive.ca/en/work/elektra-virtual-museum) explains an updateable cultural platform and credits creative direction, art direction, frontend, backend, 3D/motion, project management, and account roles. The [Haven Studios case](https://locomotive.ca/en/work/haven-studios) connects the experience to talent attraction and also exposes team credits. These cases make production and intent more visible than an effects reel.

**Mobile and accessibility.** The scrolling library documents relevant policies, but current site conformance, reduced-motion behavior, focus restoration, no-WebGL behavior, and mobile case parity were not audited.

**House Adel assessment.** Reuse the case depth, credits, independent positioning, and separation between the agency portfolio and its open-source scrolling tool. Do not add smooth-scroll machinery because Locomotive made it famous. Native scrolling should remain House Adel’s default until an experience-level need is demonstrated.

## Hello Monday

**Classification:** future-scale case-study and concept reference.

**Business layer.** [Hello Monday](https://hellomonday.com/) describes itself as a creative studio within DEPT making digital ideas, products, and experiences. Its [about page](https://hellomonday.com/about) lists teams across New York, Copenhagen, Aarhus, and Amsterdam, with roughly three dozen visible names on the access date. The [services](https://hellomonday.com/services) cover branding, digital products, and experiences.

**Governing concept and durable value.** Hello Monday’s strongest pattern is not a single portfolio interaction. It is the ability to turn a concept into a legible project story. The [work index](https://hellomonday.com/work) supports filtering and direct case routes, so the studio’s breadth remains usable beyond the home.

**Home, navigation, motion, rendering, and assets.** The portfolio uses direct project routes and rich media. Exact current portfolio framework, CMS, and renderer are not documented in the reviewed official sources. Individual cases name deliverables where relevant rather than using an unsupported studio-wide technology claim.

**Project presentation and production.** Three cases are especially useful:

- [Google Cloud Platform](https://www.hellomonday.com/work/google-cloud-platform-website) names development, UI, UX, concept, 3D modeling, and animation, and explains a narrative structured across four scales.
- [The Web Can Do What](https://www.hellomonday.com/work/the-web-can-do-what) turns a deck of digital cards into modular article pages and concise “TL;DR” routes.
- [Lyft](https://www.hellomonday.com/work/lyft) uses a flag as the central metaphor and connects it to deeper driver stories.

The important pattern is concept-to-evidence continuity: an art-directed hero becomes a structured explanation rather than replacing it.

**Mobile and accessibility.** Current keyboard order, mobile transitions, reduced-motion policy, video alternatives, no-WebGL behavior, and slow-network fallbacks were not audited.

**House Adel assessment.** Reuse the explanatory case rhythm and the discipline of tying a metaphor to a client story. Avoid copying the scale or polish without the content, production roles, and narrative reasoning that support it.

## Obys

**Classification:** highly relevant realistic stretch peer.

**Business layer.** [Obys’ about page](https://obys.agency/about) describes a concept-driven studio founded in 2018 and operating in the European Union. It says the studio intentionally remains under ten people so the founders stay close to projects. Services include creative direction, web design and development, identity, 3D, motion, and education. The practice names typography, grid, and motion as core methods.

**Governing concept and durable value.** The durable studio layer is modernist craft plus concept, not a single client aesthetic. The [works page](https://obys.agency/works/) is substantial enough to demonstrate continuity, and the [Design for Love experiment archive](https://experiment.obys.agency/about) frames experimentation as an ongoing practice rather than a secret navigation trick.

**Home, navigation, motion, rendering, and assets.** `Browser observation:` the public home offered Vertical, Horizontal, and Grid work views with direct project links. Exact renderer, framework, CMS, and asset pipeline are not documented in the sources reviewed. The service list verifies that the studio offers 3D and web development; it does not prove that the portfolio itself is WebGL.

**Project presentation and production.** The combination of commercial work, identity, web, motion, and education makes the studio’s point of view legible beyond a showreel. Its small-team statement is particularly relevant to House Adel because it frames proximity and focus as strengths rather than disguising size.

**Mobile and accessibility.** `Browser observation:` at 390 × 844 the accessibility snapshot exposed direct work links and view buttons, but also very large duplicated groups of links. `Inference:` the duplication was associated with multiple layout variants. This is not an accessibility conformance finding. It is a warning to remove inactive alternate views from the accessibility tree and tab order. Reduced-motion, focus restoration, and no-WebGL behavior remain unverified.

**House Adel assessment.** Reuse the confidence of a small concept-led team, the visible practice principles, and an explicit experiment archive. Do not let alternate presentation modes duplicate essential navigation or turn typography and motion into a fashionable house skin.

## Studio Freight

**Classification:** relevant realistic stretch peer.

**Business layer.** [Studio Freight’s info page](https://studiofreight.com/info) describes a global independent studio combining strategy, design, and experience. It lists a team of roughly 22 visible people on the access date and frames the practice around “Moving Missions Forward.” Its work covers brands, digital experiences, campaigns, and special projects.

**Governing concept and durable value.** The governing promise is operational rather than fictional. “Moving Missions Forward” can organize case selection and explanation without forcing client work into one aesthetic. The [self-case](https://studiofreight.com/work/studio-freight) describes a refreshed brand and site plus a flexible illustration language called “schematic surrealism,” including an artifact for each team member. The studio identity is clearly authored but remains separate from client identities.

**Home, navigation, motion, rendering, and assets.** `Browser observation:` the public desktop site exposed direct Home, Work, Info, News, Aeon, and Contact links, followed by direct links to multiple projects. The essential route system is semantic and ordinary even though the presentation is art-directed. Exact framework, renderer, CMS, and animation stack are not documented in the reviewed official sources.

**Project presentation and production.** The self-case connects strategy, design, and technology to a studio promise rather than only cataloguing components. This is a useful model for explaining why a portfolio system looks and behaves as it does.

**Mobile and accessibility.** The direct-link structure is promising, but keyboard focus, reduced-motion treatment, mobile parity, image alternatives, and performance tiers were not audited.

**House Adel assessment.** Reuse the idea of a house-level operating promise that governs selection, pacing, and language while allowing client worlds to differ. House Adel should not copy Freight’s illustration system; it should identify its own stable editorial behavior.

## OFF+BRAND

**Classification:** realistic stretch peer with selective WebGL production.

**Business layer.** [OFF+BRAND’s home](https://www.itsoffbrand.com/) labels work across brand, design, development, WebGL, and 3D. Its [about page](https://www.itsoffbrand.com/about-us) presents a multidisciplinary London/Glasgow team and visibly names roles including 3D artist, WebGL engineer, technical lead, designers, and developers. A [Webflow customer account](https://webflow.com/customers/off-brand) identifies founders Ross Anderson and Stuart Ross, says the studio launched in 2020, and describes Webflow as part of its scalable CMS delivery alongside custom development.

**Governing concept and durable value.** The studio identity is direct, anti-generic, and production-aware. The value after the hero is a clear mapping from projects to disciplines and a visible team capable of delivering them.

**Home, navigation, motion, rendering, and assets.** WebGL and 3D appear as selective project labels, not a claim that every route uses the same renderer. The Webflow account describes a Jasper project delivered in six weeks using WebGL animation and client-manageable content. That is project-specific evidence and a useful example of expressive frontend work around an editable CMS.

**Project presentation and production.** The studio’s manifesto experiment is instructive in a different way. [Communication Arts’ published description](https://www.commarts.com/webpicks/off-brand) says the manifesto was fragmented into five sections hidden behind taps, drags, and holds and was not designed for conversion. This makes it a legitimate experimental artifact but a poor model for essential portfolio routes.

**Mobile and accessibility.** Current portfolio keyboard behavior, gesture alternatives, reduced-motion support, no-WebGL routes, and touch-target sizing were not audited. The manifesto description itself demonstrates why every gesture must have a direct equivalent.

**House Adel assessment.** Reuse the explicit discipline labels, specialist credits, and combination of CMS manageability with selective custom rendering. Do not convert the portfolio’s core proposition into a puzzle. The user should never have to “win” access to services or work.

## Bürocratik

**Classification:** realistic stretch peer and typographic craft reference.

**Business layer.** [Bürocratik’s official site](https://www.burocratik.com/) describes an independent studio with 18 years of history, no hierarchy or investors, and capabilities across branding, digital branding, digital experience, and business design. Its public presentation emphasizes typography and detail while maintaining project links and a visible history.

**Governing concept and durable value.** Independence and rigorous design craft are the persistent layer. The current [Bürocratik book](https://book.burocratik.com/) turns the studio timeline into a tactile publishing object. The metaphor works because the subject is the studio’s own accumulated history.

**Home, navigation, motion, rendering, and assets.** `Browser observation:` typographic pacing and tactile micro-interactions are prominent, but direct project and timeline content remain central. Exact current framework, CMS, renderer, and asset pipeline are not documented in the official sources reviewed.

**Project presentation and production.** The historical timeline provides proof of continuity, a useful business signal for an independent practice. The book also demonstrates how a central format can be selected because it fits the content rather than because the studio always uses that format.

**Mobile and accessibility.** Current keyboard operation, mobile adaptation of tactile interactions, reduced motion, focus visibility, and no-JavaScript behavior were not verified.

**House Adel assessment.** Reuse the conviction that typography, business history, and details can carry authority without persistent 3D. Do not make tactile density universal; an invitation, artist release, and hospitality launch will not all benefit from the same texture or tempo.

## Basement Studio

**Classification:** future-scale production and technical-writing reference.

**Business layer.** [Basement Studio](https://basement.studio/) positions itself around work that is culturally expressive and performs commercially. Its [people page](https://basement.studio/people) describes “The Crew 38” and joins content with technology. Featured work visible on the access date included Vercel Ship, Daylight, KidSuper, and MrBeast.

**Governing concept and durable value.** The durable proposition is the refusal to separate expressive content from high-performance technical delivery. The studio reinforces this through a substantial [blog](https://basement.studio/blog), so production thinking survives beyond the portfolio hero.

**Home, navigation, motion, rendering, and assets.** Studio-authored articles document [Shader Lab](https://basement.studio/post/the-making-of-shader-lab), [React Three Fiber for KidSuper](https://basement.studio/post/kidsuper-world-bringing-paints-to-life-with-r3f), [GSAP with Next.js](https://basement.studio/post/gsap-and-nextjs-setup-the-bsmnt-way), and a [large Gatsby-to-Next.js migration](https://basement.studio/post/migrating-large-scale-websites-from-gatsby-to-nextjs). These posts verify specific practices in documented contexts. They do not prove the stack of the current home.

**Project presentation and production.** The [Apollo GraphQL launch case](https://basement.studio/post/launching-apollo-graphql-toward-future-growth) frames a digital launch around future growth rather than effects alone. The blog provides a reusable pattern for technical behind-the-scenes evidence: constraints, decisions, and migrations become part of studio authority.

**Mobile and accessibility.** Current reduced-motion, keyboard navigation, semantic fallback, no-WebGL behavior, and performance tiering were not audited. A blog about technical practice is not evidence of conformance.

**House Adel assessment.** Reuse the practice of documenting how ambitious work was built and why. A compact studio can publish smaller but more exact production notes. Do not benchmark House Adel’s launch volume or asset capacity against a 38-person crew.

## Group conclusion

This group is the strongest source of portfolio architecture lessons. Locomotive, Hello Monday, Studio Freight, and 14islands-style cases make the business purpose and production roles visible. Obys proves that a small team can lead with concept. Dennis Snellenberg, in the independent dossier, supplies the closest individual-business baseline. OFF+BRAND and Bürocratik show that experiments and tactile identity can coexist with client delivery, but also show why gestures and surface signatures must remain subordinate to direct routes.
