# Amara & Daniel invitation media

The `/invitation` experience uses a coherent five-image editorial sequence rather than procedural image substitutes or unrelated public-domain paintings. Image paths, responsive sources, focal positions, alternative text, and final replacement requirements live centrally in `src/data/invitation.ts`; invitation components do not contain wedding-specific filenames.

## Current licensed demonstration set

1. `openingHands`: Scott Broome, two people holding hands in warm light. Unsplash image `4KlDZK1xWqw`.
2. `chapel`: Debby Hudson, a sunlit wooden chapel interior. Unsplash image `sgdyBq6kheQ`. This establishes chapel atmosphere and is not documented as the named venue.
3. `couplePortrait`: Jake Johnson, two distant figures beneath a wide sky. Unsplash image `XRrQzwkH300`. The stock subjects are not identified as Amara or Daniel.
4. `coupleDetail`: Joshua Manjgo, flowers and candles on a dinner table. Unsplash image `5RfyQ9urdx0`.
5. `closing`: J. Balla Photography, two people walking hand in hand at sunset. Unsplash image `zQfToEi3z2Y`. The stock subjects are not identified as Amara or Daniel.

Each master is preserved in `assets/originals/open-access/invitation-v2/`. Responsive 720, 1280, and 1920 pixel AVIF/WebP variants are stored under `public/assets/invitation/story/`. Full source, rights, transformations, dimensions, retrieval dates, route use, and approval records live in `data/assets.json` and `docs/ASSET_PROVENANCE.md`.

## Commission replacements

Before sending this invitation for a real couple, replace the demonstration photographs centrally:

1. `openingHands`: a close horizontal photograph of the couple's joined hands with room for the title.
2. `chapel`: a true photograph of the named ceremony venue in quiet late-afternoon light.
3. `couplePortrait`: an intimate, observational photograph of the couple with a generous sense of place.
4. `coupleDetail`: a genuine secondary detail from the couple, such as their table, hands, home, or a shared object.
5. `closing`: a quiet wide photograph of the couple or venue at dusk that echoes the opening.

The story note in `invitation.story` remains clearly provisional and must be replaced with the couple's own approved words. `invitation.music.src` is intentionally `null`; audio should be enabled only after a cleared track is supplied and only after an explicit visitor gesture.
