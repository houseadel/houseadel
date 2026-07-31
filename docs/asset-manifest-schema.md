# Asset manifest contract

Version: `0.1.0`  
Status: Phase 1 working contract

Every candidate asset must be traceable from its creative purpose to its source, transformations, optimized variants, rights status, fallbacks, and approval state. Manifests live beside an asset set as `manifest.json`; generated files never overwrite raw masters.

## Required shape

```json
{
  "schemaVersion": "0.1.0",
  "universeId": "example-universe",
  "worldBrief": "docs/worlds/example/brief.md",
  "visualBible": "docs/worlds/example/visual-bible.md",
  "masterFrame": "references/worlds/example/master-frame.png",
  "updatedAt": "2026-07-30T10:00:00.000Z",
  "assets": [
    {
      "id": "example-background-01",
      "role": "background",
      "status": "candidate",
      "source": {
        "kind": "generated",
        "provider": "provider-name",
        "modelOrCollection": "model-or-library",
        "sourceUrl": null,
        "creator": "Marshall Phan / House Adel",
        "createdAt": "2026-07-30",
        "promptRecord": "references/prompts/example-background-01.md",
        "inputAssets": [],
        "seedOrJobId": null
      },
      "rights": {
        "license": "provider-commercial-terms",
        "licenseUrl": "https://example.com/terms",
        "commercialUse": "verified",
        "attribution": "not-required",
        "territoryOrTermLimits": null,
        "clientTransferAllowed": "unknown",
        "sensitiveContentReviewed": true,
        "verifiedBy": "Marshall Phan",
        "verifiedAt": "2026-07-30",
        "notes": ""
      },
      "master": {
        "path": "references/masters/example-background-01.png",
        "mediaType": "image/png",
        "width": 4096,
        "height": 2304,
        "durationSeconds": null,
        "bytes": 0,
        "sha256": ""
      },
      "transforms": [
        {
          "tool": "tool-name",
          "version": "version",
          "operation": "crop-grade-segment",
          "settingsRecord": "references/transforms/example-background-01.json",
          "createdAt": "2026-07-30"
        }
      ],
      "variants": [
        {
          "id": "desktop-avif-1920",
          "path": "public/assets/example-background-01-1920.avif",
          "mediaType": "image/avif",
          "width": 1920,
          "height": 1080,
          "durationSeconds": null,
          "bytes": 0,
          "sha256": "",
          "purpose": "desktop",
          "qualityTier": "high",
          "mediaQuery": "(min-width: 960px)",
          "poster": null
        }
      ],
      "fallback": {
        "staticAssetId": "example-background-01",
        "alt": "",
        "decorative": true,
        "failureBehavior": "Use the CSS universe color field."
      },
      "approval": {
        "creative": "pending",
        "rights": "pending",
        "technical": "pending",
        "approvedBy": null,
        "approvedAt": null,
        "notes": ""
      }
    }
  ]
}
```

## Enumerations

- `role`: `master-frame`, `background`, `midground`, `foreground`, `portal`, `mask`, `depth-map`, `texture`, `model`, `motion-loop`, `sound`, `poster`, `fallback`, `type-treatment`, `other`
- `status`: `exploration`, `candidate`, `approved`, `rejected`, `retired`
- `source.kind`: `original`, `commissioned`, `licensed`, `generated`, `procedural`, `public-domain`, `client-supplied`
- rights checks: `verified`, `restricted`, `unknown`, `not-applicable`
- approval checks: `pending`, `approved`, `rejected`
- `purpose`: `desktop`, `tablet`, `mobile`, `reduced-motion`, `no-webgl`, `slow-network`, `poster`, `social`, `archive`
- `qualityTier`: `fallback`, `low`, `medium`, `high`

## Rules

- Use stable, lowercase, hyphenated IDs; do not encode mutable dimensions in the base asset ID.
- Keep prompts and transformation settings in version-controlled records, not only provider history.
- Calculate SHA-256 for masters and variants so duplicate and accidental replacement checks are deterministic.
- Use `null`, not an invented value, when a field does not apply. Use `unknown` when it applies but has not been verified.
- Never promote an asset to `approved` while any of creative, rights, or technical approval is pending.
- Require a poster for every video and a static alternative for every model, shader-dependent image, or motion-only communication.
- Keep meaningful alternative text at the point of use when context changes; the manifest stores the default.
- Reject a build when a referenced file is missing, a production asset has unknown rights, or a required fallback is absent.
