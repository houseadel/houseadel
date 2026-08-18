# Creative Direction

## Ceremonial Spatial Editorialism

House Adel is an independent web studio working across art direction, interaction design and frontend development for weddings, birthdays, dinners, launches and private events. Its identity joins ceremonial editorial clarity, architectural precision, physical materiality, and restrained creative technology.

The governing tension is **formal architectural composition softened by intimate, human material**. The site must feel precise without becoming cold, expressive without spectacle, and technologically accomplished without presenting technology as the subject.

## Position

**Opening:** An occasion, given its own place.

**Support:** House Adel creates interactive websites for weddings, birthdays, dinners, launches and private events — art direction, interaction design and frontend development as one discipline, not handed off in sequence.

**Published work:** MARVELL 20, a digital experience created for Marvell Florist's twentieth anniversary. Marvell Florist's general branding is never presented as House Adel work; only the MARVELL 20 project is shown, and only until another genuine House Adel project exists to join it.

See `docs/COPY_APPROVED.md` for the exact fixed copy and `docs/VOICE.md` for the writing rules governing everything else.

## Visual system

### Colour

- Chalked warm ivory is the primary field.
- Ink black carries type and structure without relying on pure black everywhere.
- Soft stone creates quiet separation.
- Deep garnet or oxblood is the scarce House Adel signature.
- A restrained warm or cool metallic tone may appear as a material accent, never as a glossy effect.

### Typography

- One legally available expressive editorial serif leads display composition.
- One highly legible neutral grotesk supports navigation, metadata, forms, and longer reading.
- The serif's own italic may supply a human gesture.
- Scale, line length, alignment, and whitespace carry the identity; decorative font collecting does not.

### Composition

- Use an architectural grid, generous negative space, asymmetry with clear alignment, and frames or apertures as recurring structure.
- Allow image and type to overlap only when the relationship is legible and intentional.
- Compose mobile independently around its reading order, touch use, and crop; it is not compressed desktop.
- Alternate density carefully: moments of ceremony require room, while functional pages remain concise and direct.

### Material

Paper, vellum, restrained glass, ink, handwriting fragments, photography, archival material, lines, frames, folds, apertures, and subtle grain form one material family. Texture must feel tactile but must not reduce contrast or become nostalgic decoration.

For version one, the material system is deliberately code-native: paper tone, translucency, rules, folds, register marks, abstract handwriting, and controlled grain are produced in CSS, SVG, and simple procedural geometry. Photography and archival material remain eligible future ingredients only after provenance and human creative approval; they are not required to make the current site feel complete.

### Recurring device and camera language

The recurring device is a **single framed aperture**. It is simultaneously an entrance, an editorial crop, a reveal mask, and a registration structure. It preserves continuity between the spatial opening and quieter typographic pages without turning each section into a separate theme.

The camera language is frontal and architectural: controlled lateral separation, shallow depth, measured alignment, then one forward passage through the aperture. There is no free-roaming camera, orbiting object, or simulated building tour. Once the opening flattens into the page, type and grid resume authority; bounded parallax may continue there as a page-level device (see Interaction and feedback), distinct from camera movement inside the WebGL opening itself.

## Interaction and feedback

The interaction layer — cursor, hover, parallax, marquee, scroll reveal — follows the same test already applied to the camera and the aperture: it is successful when it clarifies hierarchy, orients the visitor, reveals material, or confirms an action, and it is removed when it has no such role. Restraint is expressed through purpose and precision, not through the absence of a device.

- A single cursor companion may track the pointer and change state on hover intent, to confirm what an element does before it is pressed. It supplements the native cursor; it never hides, replaces, or delays it, and it stands down entirely on touch input and under reduced motion.
- Primary actions may pull toward the pointer within a small, capped radius before release. This is feedback that an element is interactive, not a decorative flourish, and it never substitutes for a visible focus state.
- A marquee may carry real, reachable content — a running index of disciplines or credits — never a decorative loop with no informational content. It always ships with a static, non-animated equivalent for assistive technology and pauses off-screen and under reduced motion.
- Parallax depth is bounded, tied to real content layers (not filler), and flattens on mobile and under reduced motion rather than merely slowing down.
- Scroll-triggered typographic reveal (line and word masking) extends the aperture's own logic of uncovering rather than introducing a separate idea; it renders the final text state immediately for reduced-motion visitors rather than performing a shortened version of the split.

## Spatial opening

The homepage begins on a complete ivory static composition before WebGL is requested. Its project-owned CSS/SVG planes, frames, ruled details, and garnet aperture form the master frame. A progressively enhanced scene replaces only the spatial layer when ready, using simple procedural planes, thin frames, translucent surfaces, and restrained light with no texture, image, video, or model payload. Scattered elements align; the camera passes through the same aperture; the composition flattens into the editorial page.

The opening is brief, reversible where scrubbed, and never blocks navigation. DOM typography and links remain authoritative. Once the transition completes, motion intensity decreases so projects, service distinction, and enquiry become the focus.

## Editorial character

Language is short, factual, and plain. It never performs inherited luxury or implies an institution, team, client history, or result that does not exist. Avoid phrases such as "timeless elegance," "elevate your special day," "create magic together," and other generic agency or wedding language. `docs/VOICE.md` sets the operational rules — no em dashes, no fashion-luxury vocabulary, no "commission"/"investment," no price or budget mentions anywhere on the site — so this standard is applied the same way across every page rather than re-derived per section. `docs/COPY_APPROVED.md` is the literal source for every page this brief already fixes.

House Adel shows only its real, published work. MARVELL 20 is shown as House Adel work; Marvell Florist's general branding is not.

## Asset policy

No generative-AI image, video, person, wedding photography, or 3D asset may appear. Assets must be project-owned, verified CC0/public-domain museum material, or manually approved licensed material with complete provenance. Public-domain art is contextual material, never fake wedding documentation.

Code-native SVG line work, CSS composition, procedural geometry, typography, and project-owned graphic systems are preferred where they express the idea without unverifiable imagery.

## Explicit exclusions

The site is not a template marketplace, generic agency portfolio, cyberpunk developer page, fashion-house imitation, effects reel, or collection of unrelated styles. Do not use generic cards, constant dark mode, glowing grids, particles, decaying mouse trails, novelty/liquid cursor replacements, rotating chrome, visual-reference screenshots, copied compositions, or decorative WebGL run without a content or feedback role. A quiet cursor companion, magnetic hover on primary actions, a content-bearing marquee, and bounded parallax are permitted — each is held to the purpose test in Interaction and feedback above, not exempted from it.

Technology is successful when it clarifies hierarchy, changes context, reveals material, introduces work, explains a process, demonstrates a product function, or provides feedback. It is removed when it has no such role.

## Sound direction

Sound is off by default and requires an explicit choice. The first-visit loader offers "Enter with sound" and "Continue without sound" alongside Skip; a persistent header control lets a visitor turn sound on or off at any time afterward. Cues are short synthesized tones, never a downloaded or looping audio file, and no audio autoplays.
