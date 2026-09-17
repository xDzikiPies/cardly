const {
  withAndroidManifest,
  withDangerousMod,
  withEntitlementsPlist,
  AndroidConfig,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const AID = "F222222222";

module.exports = function withNfcHce(config) {
  // 1. USUWANIE PROBLEMATYCZNEGO ENTITLEMENT DLA IOS
  config = withEntitlementsPlist(config, (config) => {
    delete config.modResults["com.apple.developer.nfc.readersession.formats"];
    return config;
  });

  // 2. KONFIGURACJA ANDROID MANIFEST
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application[0];

    AndroidConfig.Permissions.ensurePermissions(manifest, [
      "android.permission.NFC",
    ]);

    if (!manifest.manifest["uses-feature"]) manifest.manifest["uses-feature"] = [];
    manifest.manifest["uses-feature"].push({
      $: { "android:name": "android.hardware.nfc.hce", "android:required": "false" },
    });

    if (!app.service) app.service = [];
    const alreadyRegistered = app.service.some(
      (s) => s.$["android:name"] === "com.reactnativehce.services.CardService"
    );

    if (!alreadyRegistered) {
      app.service.push({
        $: {
          "android:name": "com.reactnativehce.services.CardService",
          "android:exported": "true",
          "android:permission": "android.permission.BIND_NFC_SERVICE",
        },
        "intent-filter": [
          { action: [{ $: { "android:name": "android.nfc.cardemulation.action.HOST_APDU_SERVICE" } }] },
        ],
        "meta-data": [
          {
            $: {
              "android:name": "android.nfc.cardemulation.host_apdu_service",
              "android:resource": "@xml/aid_list",
            },
          },
        ],
      });
    }

    return config;
  });

  // 3. GENEROWANIE AID_LIST DLA ANDROIDA
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const xmlDir = path.join(config.modRequest.platformProjectRoot, "app/src/main/res/xml");
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(
        path.join(xmlDir, "aid_list.xml"),
        `<?xml version="1.0" encoding="utf-8"?>
<host-apdu-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/app_name"
    android:requireDeviceUnlock="false">
    <aid-group android:description="@string/app_name" android:category="other">
        <aid-filter android:name="${AID}" />
    </aid-group>
</host-apdu-service>
`
      );
      return config;
    },
  ]);

  return config;
};