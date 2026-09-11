# Privacy

The Safex Mine is designed as a privacy-first local mining application.

## Project policy

The application should collect and transmit **no analytics, telemetry, usage statistics or personal information** to the project maintainers.

## Local information

The application may store locally:

- the user's public Safex receiving address;
- selected node address;
- application settings such as mining mode and mute state;
- diagnostic logs/captures where required for troubleshooting.

The app must never request or store:

- Safex private keys;
- seed phrases;
- wallet passwords.

## Runtime statistics

Hashrate, selected mode, node status and accepted/rejected counts are local runtime information displayed to the user. They are not project telemetry and must not be silently uploaded.

## Network traffic

The expected normal external connection is to the user's selected Safex node. The default is `rpc.safex.org:17402` without TLS. A custom LAN/node address may be used through Settings.

Any future update-check or diagnostic-upload feature must be explicit, documented and user-controlled before implementation.
