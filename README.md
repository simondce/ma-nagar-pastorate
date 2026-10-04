# St. John’s Church, M. A Nagar Pastorate — review prototype

A mobile-friendly English/Tamil React prototype for St. John’s Church, MA Nagar, and its branch churches: CSI Church, Sholavaram; CSI Church, Laranodai; and CSI Church, Siruniyam. Member, pastor, service, and fundraising data are fictional samples. The public site opens without login; the labeled staff demonstration supports head pastor, church pastor, administrator, committee member, secretary, and treasurer roles.

The header’s **EN / தமிழ்** switch remembers the selected language. Phone layouts include touch-sized actions and one-column forms. The original church logo is available in `public/st-johns-logo.svg` and its emblem in `public/church-mark.svg`. The verified address and map links are in `src/church-location.js`.

## Review online

The prototype is published on [GitHub Pages](https://simondce.github.io/ma-nagar-pastorate/). Source code is on `main`; the locally tested production bundle is on `gh-pages`. Repository Settings → Pages uses **Deploy from a branch → gh-pages → / (root)**. Relative asset paths and hash navigation work under the repository URL without a custom server.

The initial custom Actions deployment could not start because GitHub reported an account billing lock. Branch-based Pages publishing succeeded. Updates currently require running the tests and build locally, then publishing the contents of `dist` to `gh-pages`; pushing source changes to `main` alone does not update the site. An optional manual `Publish church prototype` workflow is retained for future use after resolving the Actions account restriction and switching Pages to **GitHub Actions**.

Public visitors can read notices, view church information and directions, register for approval, make simulated contributions, and submit sample prayer requests. The public interface does not show the member directory, pastoral inbox, or contributor ledger. **Staff login → Enter demo workspace** demonstrates the management area. It is deliberately labeled as a demo: there is no password or production authentication.

## Run locally

Use Node.js 24 and pnpm 11.19.0, matching the deployment workflow.

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:5173. `pnpm build` creates the production bundle in `dist`; `pnpm preview` serves it locally. `pnpm test` runs the domain tests.

## Explore the prototype

**WhatsApp backend demo:** [Follow the Meta setup guide](WHATSAPP_SETUP.md) to configure the server-side test sender. **Communications → Meta WhatsApp test** sends to one verified test recipient after backend setup. The Meta token stays on the backend; audience campaigns and SMS remain simulated.

- **Overview:** church scope, community totals, approvals, celebrations, and notices.
- **Members:** searchable and filterable directory, CSV export, profiles, editing, self-registration, approvals, and archival with a departure reason. One primary church and optional secondary churches per person. Existing Sandhai numbers are checked within each church; issuing a new number requires explicit confirmation. The combined church prefix and number identify a member across the pastorate.
- **Churches:** diocese → pastorate → branch hierarchy, pastor assignments, and church-specific member views.
- **Communications:** WhatsApp/SMS composer, templates, drafts, individual or multi-church targeting, overlapping fellowships and role groups, recipient deduplication, and channel consent. Pending and archived members are excluded. Sends and schedules create demo records only.
- **Celebrations:** upcoming birthdays and wedding anniversaries, personal blessing composer, and saved morning-wish preferences.
- **Notice board:** announcement publishing, categories, location, event details, and pinned notices.
- **Giving:** church initiatives, goals, separate pledged/collected totals, online demo contributions, cash and bank-transfer recording, and a contribution ledger.
- **Prayer requests:** submission, assigned church/head pastors, confidential display, and a labeled pastoral preview for acknowledging and resolving requests.
- **Settings:** pastorate details, configurable age boundaries, role descriptions, and wish preferences. Youth also belong to men’s/women’s groups; middle-aged and senior groups have gender-specific subgroups.

## Prototype boundaries

Changes are saved to this browser’s local storage. This is a single-user demonstration, not a production database. The directory contains fictional data. Use sample information only.

The optional Meta WhatsApp test backend can send real messages after configuration; its separate demo key protects that endpoint. The sample audience composer and SMS remain simulations. No payment gateway, production authentication service, or background scheduler is connected. No money is charged by the prototype. The prayer confidentiality switch and described roles are UI demonstrations, not security boundaries. Work anniversaries are not modeled because the brief does not specify an employment/service start date; birthdays and wedding anniversaries are implemented.

A production release needs authenticated accounts, server-enforced role and church scopes, a transactional database with church-scoped membership constraints, a reviewed registration workflow, consent auditing, payment verification and receipts, authenticated private prayer access, messaging provider integration, and an Asia/Kolkata scheduler for wishes. It also needs backups, audit logs, and server-side validation. Don’t deploy this demo as a live member registry.

## Source layout

- `src/App.jsx`: application shell, navigation, local persistence, and shared state.
- `src/Dashboard.jsx`: overview and global church selector.
- `src/Pages.jsx`: directory, church, communications, community, and settings pages.
- `src/Dialogs.jsx`: member, approval, messaging, giving, announcement, and prayer workflows.
- `src/domain.js`: membership, audience, fellowship, and celebration rules.
- `src/data.js`: fictional sample data.
- `src/styles.css`: responsive design, states, and motion preferences.
- `tests/domain.test.js`: behavioral tests for domain rules and edge cases.

`src/PublicPortal.jsx` provides the public site and staff entry. `src/i18n.js` and `src/tamil.js` translate visible interface text while preserving canonical form values and identifiers. `src/LocationSection.jsx` shows the verified address, Google Maps embed, and directions. User-authored announcement and message text is retained in the language in which it was entered.

The church logo and illustration are original SVG assets. Icons use Lucide; fonts use Google Fonts (DM Sans, Manrope, and Noto Sans Tamil) with local sans-serif fallbacks. The Maps address was verified from the link supplied by the user; other church locations have not been inferred.
