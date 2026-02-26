# Changelog

## [1.10.0](https://github.com/descope/node-sdk/compare/v1.9.1...v1.10.0) (2026-02-26)


### Features

* access key custom attributes CRU ([#645](https://github.com/descope/node-sdk/issues/645)) ([145d363](https://github.com/descope/node-sdk/commit/145d3634ab3d60655bdb1124c60149bff5e514e9))
* **authz:** route whoCanAccess and whatCanTargetAccess through FGA cache ([#658](https://github.com/descope/node-sdk/issues/658)) ([e7d0b2b](https://github.com/descope/node-sdk/commit/e7d0b2b62a6ac4403a23172b18b21b050dd0a4cf))
* role inheritence config for sub tenants ([#648](https://github.com/descope/node-sdk/issues/648)) ([ae4d906](https://github.com/descope/node-sdk/commit/ae4d906df901bfe31808333c6131280c7efa3b91))


### Bug Fixes

* **deps:** update dependency @descope/core-js-sdk to v2.56.2 ([#647](https://github.com/descope/node-sdk/issues/647)) ([7a2d6f3](https://github.com/descope/node-sdk/commit/7a2d6f3a299f2ea359a19a1b9df0c8df221d0694))
* **deps:** update dependency @descope/core-js-sdk to v2.57.0 ([#650](https://github.com/descope/node-sdk/issues/650)) ([3b49073](https://github.com/descope/node-sdk/commit/3b4907321f9f8a29cc771338a1354b6b0a7dbe52))
* expose SSO SAML mapping default roles ([49d7a67](https://github.com/descope/node-sdk/commit/49d7a6723b98e498fa10e3953afc689e4f257282))
* expose SSO SAML mapping default roles ([49d7a67](https://github.com/descope/node-sdk/commit/49d7a6723b98e498fa10e3953afc689e4f257282))

## [1.9.1](https://github.com/descope/node-sdk/compare/v1.9.0...v1.9.1) (2026-01-15)


### Bug Fixes

* authzNode missing type ([#643](https://github.com/descope/node-sdk/issues/643)) ([aa69c35](https://github.com/descope/node-sdk/commit/aa69c3520872d75c46ffeb70429b1ad6afe6336a))

## [1.9.0](https://github.com/descope/node-sdk/compare/v1.8.0...v1.9.0) (2026-01-07)


### Features

* **fga:** add fgacacheurl parameter for cache proxy support ([#642](https://github.com/descope/node-sdk/issues/642)) ([fae0133](https://github.com/descope/node-sdk/commit/fae01337c4075c95dc3f589dd77c4fbc043a1737))


### Bug Fixes

* support git commit -m with commitlint hook ([#640](https://github.com/descope/node-sdk/issues/640)) ([9624dde](https://github.com/descope/node-sdk/commit/9624ddeda6e5ba619f7dc09f8c57b83f704b28d3))

## [1.8.0](https://github.com/descope/node-sdk/compare/v1.7.7...v1.8.0) (2026-01-04)


### Features

* Add token fetching methods for outbound applications ([#540](https://github.com/descope/node-sdk/issues/540)) ([51b975f](https://github.com/descope/node-sdk/commit/51b975f76d8434a14526c35a28f4fc129edd704b))
* descopers & management key CRUD ([#613](https://github.com/descope/node-sdk/issues/613)) ([195d72d](https://github.com/descope/node-sdk/commit/195d72d0f2de30afee9ec640768222796fea252b))


### Bug Fixes

* allow array of string for multi select custom attributes ([#444](https://github.com/descope/node-sdk/issues/444)) ([c43f7b5](https://github.com/descope/node-sdk/commit/c43f7b5b30d736b293e92bf708a4685dbcd60a1d))
* Correct typos in README.md ([#549](https://github.com/descope/node-sdk/issues/549)) ([9a2de85](https://github.com/descope/node-sdk/commit/9a2de85fefe2454991d8f0e129e5f55d030a197d))
* **deps:** security upgrade express from 4.19.2 to 4.22.0 ([#628](https://github.com/descope/node-sdk/issues/628)) ([a9ad297](https://github.com/descope/node-sdk/commit/a9ad297a4a180fc4a6c3b2faf47a25913442ee8d))
* **deps:** update dependency @descope/core-js-sdk to v2.44.3 ([#528](https://github.com/descope/node-sdk/issues/528)) ([a0d51bc](https://github.com/descope/node-sdk/commit/a0d51bc9ff75ccf276a1bc1381522ced432151df))
* **deps:** update dependency @descope/core-js-sdk to v2.44.4 ([#551](https://github.com/descope/node-sdk/issues/551)) ([c1ace65](https://github.com/descope/node-sdk/commit/c1ace6575d6c42405f9e86c4bf18f296f0be2f3b))
* **deps:** update dependency @descope/core-js-sdk to v2.44.5 ([#558](https://github.com/descope/node-sdk/issues/558)) ([105f0c9](https://github.com/descope/node-sdk/commit/105f0c9035be63da2ddcec8ed4b40aed4cc4034b))
* **deps:** update dependency @descope/core-js-sdk to v2.45.0 ([#559](https://github.com/descope/node-sdk/issues/559)) ([ed76054](https://github.com/descope/node-sdk/commit/ed760547b5c37027d258642c5f765c7c8d0b0e05))
* **deps:** update dependency @descope/core-js-sdk to v2.46.0 ([#565](https://github.com/descope/node-sdk/issues/565)) ([320fb99](https://github.com/descope/node-sdk/commit/320fb999bfe370718c0f35c6a30cbe19b9f1e338))
* **deps:** update dependency @descope/core-js-sdk to v2.46.1 ([#566](https://github.com/descope/node-sdk/issues/566)) ([a3c4970](https://github.com/descope/node-sdk/commit/a3c4970fefcd7aeaeea545fd9d913e34e5d76654))
* **deps:** update dependency @descope/core-js-sdk to v2.46.2 ([#567](https://github.com/descope/node-sdk/issues/567)) ([0295559](https://github.com/descope/node-sdk/commit/02955597f869133e120e903dcd49d626f3b72968))
* **deps:** update dependency @descope/core-js-sdk to v2.47.0 ([#571](https://github.com/descope/node-sdk/issues/571)) ([cd44bbe](https://github.com/descope/node-sdk/commit/cd44bbebd8b434acb100524970c578283b7e3fc3))
* **deps:** update dependency @descope/core-js-sdk to v2.48.0 ([#572](https://github.com/descope/node-sdk/issues/572)) ([49faba4](https://github.com/descope/node-sdk/commit/49faba4cfe37f06e611eb9575dfb22a42d102932))
* **deps:** update dependency @descope/core-js-sdk to v2.49.0 ([#575](https://github.com/descope/node-sdk/issues/575)) ([9f0e0c5](https://github.com/descope/node-sdk/commit/9f0e0c5257a3c77744ba33a8b8d4f3c24d2a31bb))
* **deps:** update dependency @descope/core-js-sdk to v2.50.0 ([#581](https://github.com/descope/node-sdk/issues/581)) ([524fbf3](https://github.com/descope/node-sdk/commit/524fbf3f0509122f7c7c09e24a9f57cae3138778))
* **deps:** update dependency @descope/core-js-sdk to v2.50.1 ([#588](https://github.com/descope/node-sdk/issues/588)) ([287d828](https://github.com/descope/node-sdk/commit/287d828d23184f7f309655e82f0d5112f2916106))
* **deps:** update dependency @descope/core-js-sdk to v2.51.0 ([#592](https://github.com/descope/node-sdk/issues/592)) ([df55f70](https://github.com/descope/node-sdk/commit/df55f70e31c5e98074ea354b6cd080ea5788b37b))
* **deps:** update dependency @descope/core-js-sdk to v2.52.1 ([#596](https://github.com/descope/node-sdk/issues/596)) ([22a9170](https://github.com/descope/node-sdk/commit/22a9170450ce0c26b9e9c941ffbb3edcec2501ea))
* **deps:** update dependency @descope/core-js-sdk to v2.52.2 ([#599](https://github.com/descope/node-sdk/issues/599)) ([80e0e80](https://github.com/descope/node-sdk/commit/80e0e8096dc27486018541b827e7f1bd6a86366e))
* **deps:** update dependency @descope/core-js-sdk to v2.53.0 ([#604](https://github.com/descope/node-sdk/issues/604)) ([eddb32c](https://github.com/descope/node-sdk/commit/eddb32ca73e3b60539ed804967ecbd85bcd3c647))
* **deps:** update dependency @descope/core-js-sdk to v2.53.1 ([#606](https://github.com/descope/node-sdk/issues/606)) ([c768daa](https://github.com/descope/node-sdk/commit/c768daa66f3112031f502d0fd5d3dfb7e5e1463b))
* **deps:** update dependency @descope/core-js-sdk to v2.54.0 ([#617](https://github.com/descope/node-sdk/issues/617)) ([17782c6](https://github.com/descope/node-sdk/commit/17782c6bd9c95f999759d68d8bba472cc4459681))
* **deps:** update dependency @descope/core-js-sdk to v2.56.0 ([#619](https://github.com/descope/node-sdk/issues/619)) ([f4e5df2](https://github.com/descope/node-sdk/commit/f4e5df2db4d018d4a83a8d42cbb6bcb83f002269))
* Fix jwt refresh errors when using jwts in cookies RELEASE ([#535](https://github.com/descope/node-sdk/issues/535)) ([c61c76b](https://github.com/descope/node-sdk/commit/c61c76be8b73807b5a12dfd0a8d642a540d57b48))
* Issue8683 ([#561](https://github.com/descope/node-sdk/issues/561)) ([b457c17](https://github.com/descope/node-sdk/commit/b457c17fbe60fcae51856acda6a583aee476425e))
* return refresh JWT ([#530](https://github.com/descope/node-sdk/issues/530)) ([e0dad0b](https://github.com/descope/node-sdk/commit/e0dad0b1a4b37bd7bcee7d876563c02f4a8a55be))
* **workflows:** add GitHub App token generation step ([#634](https://github.com/descope/node-sdk/issues/634)) ([29231c6](https://github.com/descope/node-sdk/commit/29231c63ce1be79cc7c3497dae65861d03b9ecb1))

## 1.7.7 (2025-06-11)

### Features

initial release with release please.
