# VirtualFitPath

VirtualFitPath is a responsive ecommerce storefront and protected operations back office for research compounds. The application uses the VirtualFitPath visual system, adds a safer checkout flow, and includes catalogue, inventory, order, customer, discount, batch-certificate, and store-setting management.

Customer support: `800-637-9046`
Legal entity: `Virtual Fit Path, LLC`

## Local development

1. Copy `.env.example` to `.env.local` and provide the development deployment URL.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

Production checkout intentionally stays disabled until both the payment credentials and `NEXT_PUBLIC_CHECKOUT_ENABLED=true` are configured. Back-office accounts, sessions, and authorization are managed independently inside the VirtualFitPath Convex deployment.

## Validation

Run `npm run typecheck`, `npm run lint`, and `npm run build` before release.

## Documentation

The permanent user guide, feature log, and bug-fix log are published at [floral-harbor-35bk.here.now](https://floral-harbor-35bk.here.now/). The versioned source is in `docs-site/`.
