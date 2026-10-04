# Meta WhatsApp backend demo

The prototype includes a real server-side sender for Meta's WhatsApp Cloud API. It requires your Meta configuration and a running backend before it can send. GitHub Pages hosts the frontend only.

The demo sends to **one test recipient configured on the server**. It never sends to the fictional member directory. Audience campaigns and SMS remain simulations.

## 1. Set up Meta

1. Open [Meta for Developers](https://developers.facebook.com/apps/) and create an app with the **Connect with customers through WhatsApp** use case (or add the WhatsApp product if your dashboard uses that layout).
2. Open the WhatsApp **API Setup / Getting started** screen. Use Meta's supplied test sender for this demo.
3. In the recipient / **To** selector, add your own WhatsApp number and complete the verification shown by Meta.
4. Locate the **temporary access token**, **Phone number ID**, and Graph API version in the example request. The phone number ID is an identifier, not the visible phone number or WhatsApp Business Account ID.
5. Keep these values in your backend's environment settings. Do not paste the token into chat, the public website, GitHub, or a `VITE_` variable. Replace the temporary token when it expires.

Meta's [Cloud API documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) and [official API collection](https://www.postman.com/meta/whatsapp-business-platform/collection/wlk6lh4/whatsapp-cloud-api) cover the setup and message requests. Dashboard labels can vary by app configuration.

## 2. Run the backend locally

Use Node.js 24. Copy `.env.example` to `.env` without overwriting an existing file. The `.env` file is excluded from Git.

Fill these server settings:

| Setting | Value |
| --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | Meta temporary access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number ID from API Setup |
| `WHATSAPP_GRAPH_VERSION` | Version from Meta's example, such as `v24.0` |
| `WHATSAPP_TEST_RECIPIENT` | Your verified recipient in international digits, e.g. country code followed by number; no `+`, spaces, or punctuation |
| `WHATSAPP_DEMO_KEY` | Separate random key of at least 32 characters; this protects the backend from public send requests |
| `ALLOWED_ORIGINS` | Exact frontend origins; the example includes the local site and `https://simondce.github.io` |

Generate the separate demo key locally with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the frontend and backend in separate terminals:

```sh
pnpm dev
pnpm server
```

Use the local frontend at `http://127.0.0.1:5173` with backend `http://127.0.0.1:3001`. A hosted HTTPS frontend needs an HTTPS backend; don't point the GitHub Pages version at a local HTTP server.

## 3. Host the backend for the GitHub Pages demo

The repository includes a [Render Blueprint](https://render.com/docs/blueprint-spec) in `render.yaml` with a free web-service configuration. Review Render's current account requirements and plan before deployment; no Render service has been created by this project setup.

1. In your Render account, create a **Blueprint** using `https://github.com/simondce/ma-nagar-pastorate`, branch `main`.
2. Supply the four `WHATSAPP_` fields requested by the Blueprint: access token, phone number ID, Graph version, and test recipient.
3. Render generates `WHATSAPP_DEMO_KEY` separately. Retrieve it from the service environment settings for the staff test screen.
4. After the service is running, copy its HTTPS URL. Keep `ALLOWED_ORIGINS=https://simondce.github.io`. For other frontend hosts, explicitly add their origins.
5. Open the [church prototype](https://simondce.github.io/ma-nagar-pastorate/), enter the staff demo, and use the test screen below. No frontend rebuild is needed to enter the backend URL.

The backend has no extra npm dependencies. Its build command is `node --version`, its start command is `node server/index.js`, and its health endpoint is `/health`. Other Node hosting services can run the same entry point and environment settings.

## 4. Send the first test

1. **Staff login → Administrator → Enter demo workspace → Communications → Meta WhatsApp test**.
2. Enter the backend URL and **backend demo key**. This is not the Meta access token. The key stays in memory until the dialog closes.
3. Select **Check backend**. Verify the displayed test recipient. This checks backend configuration; Meta validates the token when sending.
4. Select **Meta starter template (hello_world)** and click **Send test via Meta**. The backend sends Meta's English starter template to your verified test recipient.
5. Check WhatsApp on that phone. The site shows **Accepted by Meta** and the message ID if Meta accepts the request. This is not a delivery receipt.
6. Reply from that phone to the Meta test sender. Within the customer-service window (24 hours after a recipient message), select **Prepare another test → Custom message** and send your own English or Tamil message.

You can also choose **Test via Meta** in the existing WhatsApp composer to use its message text. The destination still comes exclusively from the backend configuration.

## Demo limits and troubleshooting

- An expired/invalid token must be replaced in server settings. Restart a local backend after editing `.env`; redeploy/restart a hosted service as required by its host.
- `recipient_not_verified`: add and verify the recipient in Meta API Setup.
- `reply_required`: have the recipient reply to the sender, or start with an approved template. The demo only supports Meta's `hello_world` template, available with the test sender.
- A timeout has an uncertain outcome. Check the phone before preparing another test. Rechecking the same request uses its idempotency key and does not intentionally resend it.
- The backend allows at most five new requests per minute. Duplicate protection lasts one hour in memory and resets on server restart. Run a single instance for this demo.
- Delivery/read receipts, webhooks, multi-recipient campaigns, scheduling, and production staff authentication are not implemented. The demo key is a shared test credential, separate from the prototype's simulated staff login.
- A production rollout needs per-user authorization, persistent idempotency and delivery records, opt-in/recipient controls, approved templates, and verified webhooks before enabling church-wide messaging.

## Verification

`pnpm test` includes backend authorization, origin restrictions, fixed-recipient targeting, Tamil payloads, provider rejection, duplicate requests, uncertain outcomes, and rate limits. Tests mock Meta: they send no real WhatsApp messages. Real delivery can only be verified after you configure Meta and run the first test above.
