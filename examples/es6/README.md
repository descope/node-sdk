# Example Node ES6 app

This example demonstrates how to use the Descope SDK in a Node.js Express application.

## Running example

### Setup

1. Install dependencies

```
npm install
```

2. Generate Certificates
   This example uses a self-signed certificate for the server.

```
npm run generateCerts
```

2. Build the SDK
   This example builds the SDK from the source code.
   Note: this step is required every time you make changes to the SDK.

```
(cd ../.. && npm install && npm run build)
```

3. Set the environment variables

```
# .env
DESCOPE_PROJECT_ID=<Descope project ID>
DESCOPE_BASE_URL=<Descope API base URL> # optional, Descope will use the default URL if not provided
PORT=8082 # optional, default is 443
```

4. Run the example

```
npm start
```

You can now access the example app at `https://localhost:443`.

```bash
# Get public data, the -k flag is used to ignore the self-signed certificate
curl -k https://localhost:443/api/public
```

### Docker

You can run the application using Docker.

build the image:

```
docker build . --tag node-example
```

run the image:

```
docker run -d -e DESCOPE_PROJECT_ID=${PROJECT_ID} -p 443:443 node-example
```

## Usage

### Sign Up Or In Using OTP

To sign up or sign in using OTP, send a POST request to `/otp/sign-up-or-in` with the email address.

```
curl -X POST -k https://localhost:443/otp/sign-up-or-in -H 'Content-Type: application/json' --data '{"email": "<email>"}'
```

### Verify OTP

```
curl -X POST -k https://localhost:443/otp/verify -H 'Content-Type: application/json' --data '{"email": "<email>", "code": "<otp-code>"}'
```

See `src/index.ts` for the full list of routes.
