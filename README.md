# Descope Node.js SDK

Use the Descope NodeJS SDK for NodeJS/Express to quickly and easily add user authentication to your application or website.

## Installing the SDK

Replace any instance of `<ProjectID>` in the code below with your company's Project ID, which can be found in the [Descope console](https://app.descope.com).

Run the following code in your project. These commands will add the Descope SDK for Node as a project dependency, and set the `DESCOPE_PROJECT_ID` variable to a valid \<ProjectID\>.

```bash
npm i --save @descope/node-sdk
```

## What do you want to implement?

Click one of the following links to open the documentation for that specific functionality.  

- [x] [One time passwords (OTP)](./docs/otp.md)
- [x] [Magic Links](./docs/magiclink.md)
- [x] [OAuth/Social](./docs/oauth.md)

## Run the Examples

Instantly run the end-to-end ExpresSDK for NodeJS examples, as shown below. The source code for these examples are in the folder [GitHub node-sdk/examples folder](https://github.com/descope/node-sdk/blob/main/examples).

### Prerequisites

Run the following commands in your project. Replace any instance of  `<ProjectID>` in the code below with your company's Project ID, which can be found in the [Descope console](https://app.descope.com).

This commands will add the Descope NodeJS SDK as a project dependency, clone the SDK repository locally, and set the `DESCOPE_PROJECT_ID`.

```code bash
git clone github.com/descope/node-sdk
export DESCOPE_PROJECT_ID=<ProjectID>
```

### Run an example

**TL;DR**: Run `npm run quick`

Run the following commands in the root of the project to build and run the examples.
1. Run this to start the ES6 typescript module example

    ```code bash
    npm i && \
    npm run build && \
    cd examples/es6 && \
    npm i && \
    npm run generateCerts && \
    npm start
    ```

2. Run this to start the commonjs example

    ```code bash
    npm i && \
    npm run build && \
    cd examples/commonjs && \
    npm i && \
    npm run generateCerts && \
    npm start
    ```

## License

The Descope ExpresSDK for Node is licensed for use under the terms and conditions of the [MIT license Agreement](https://github.com/descope/node-sdk/blob/main/LICENSE).
