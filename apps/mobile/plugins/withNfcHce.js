const { withAndroidManifest, withDangerousMod, AndroidConfig } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * react-native-hce (Android HCE — emulacja karty NFC) wymaga ręcznej konfiguracji natywnej,
 * której Expo nie robi automatycznie. Ten plugin robi to za nas przy `expo prebuild`
 * (czyli też przy każdym EAS Buildzie): dopisuje uprawnienia, feature NFC-HCE, plik
 * aid_list.xml, i rejestruje serwis HCE w AndroidManifest.xml.
 *
 * Po dodaniu/zmianie tego pluginu w app.json trzeba zrobić NOWY natywny build
 * (development albo production) — samo `expo start` tego nie podciągnie.
 */
const AID = "F222222222"; // dowolny, unikalny AID dla naszej apki (hex, parzysta liczba znaków)

module.exports = function withNfcHce(config) {
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
