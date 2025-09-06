#!/usr/bin/env node

/**
 * Script de test de sécurité pour dlpz.fr
 * Teste les protections contre les exécutions malveillantes
 */

import {
  validateMimeType,
  validateFilename,
  analyzeFileContent,
  sanitizeUrl,
  sanitizeInput,
} from "./middleware/security.js";
import fs from "fs/promises";
import { join } from "path";

const tests = [
  {
    name: "Validation des types MIME",
    tests: [
      {
        input: { mimetype: "image/jpeg", filename: "test.jpg" },
        expected: true,
        description: "JPEG valide",
      },
      {
        input: { mimetype: "image/jpeg", filename: "test.exe" },
        expected: false,
        description: "Extension ne correspond pas au MIME",
      },
      {
        input: { mimetype: "application/php", filename: "test.php" },
        expected: false,
        description: "Type MIME non autorisé",
      },
    ],
  },
  {
    name: "Validation des noms de fichiers",
    tests: [
      {
        input: "image.jpg",
        expected: true,
        description: "Nom de fichier valide",
      },
      {
        input: "script.js",
        expected: false,
        description: "Extension dangereuse",
      },
      {
        input: "test<script>.jpg",
        expected: false,
        description: "Caractères dangereux",
      },
      {
        input: "con.jpg",
        expected: false,
        description: "Nom réservé Windows",
      },
    ],
  },
  {
    name: "Sanitisation des URLs",
    tests: [
      {
        input: "https://example.com",
        expected: true,
        description: "URL valide",
      },
      {
        input: "http://localhost:3002",
        expected: false,
        description: "URL privée",
      },
      {
        input: "javascript:alert(1)",
        expected: false,
        description: "Protocole dangereux",
      },
      {
        input: "https://bit.ly/malicious",
        expected: false,
        description: "Domaine de raccourcissement",
      },
    ],
  },
  {
    name: "Sanitisation des entrées",
    tests: [
      {
        input: "Hello World",
        expected: "Hello World",
        description: "Texte normal",
      },
      {
        input: "<script>alert(1)</script>",
        expected: "&lt;script&gt;alert(1)&lt;&#x2F;script&gt;",
        description: "HTML échappé",
      },
      {
        input: "test\x00\x01\x02",
        expected: "test",
        description: "Caractères de contrôle supprimés",
      },
    ],
  },
];

// Fonction de test
const runTests = async () => {
  console.log("🧪 Tests de sécurité dlpz.fr\n");

  let totalTests = 0;
  let passedTests = 0;

  for (const testSuite of tests) {
    console.log(`📋 ${testSuite.name}`);

    for (const test of testSuite.tests) {
      totalTests++;

      try {
        let result;

        switch (testSuite.name) {
          case "Validation des types MIME":
            result = validateMimeType(test.input.mimetype, test.input.filename);
            result = result.valid;
            break;

          case "Validation des noms de fichiers":
            result = validateFilename(test.input);
            result = result.valid;
            break;

          case "Sanitisation des URLs":
            result = sanitizeUrl(test.input);
            result = result.valid;
            break;

          case "Sanitisation des entrées":
            result = sanitizeInput(test.input);
            result = result === test.expected;
            break;
        }

        const passed = result === test.expected;
        if (passed) {
          passedTests++;
          console.log(`  ✅ ${test.description}`);
        } else {
          console.log(
            `  ❌ ${test.description} (attendu: ${test.expected}, obtenu: ${result})`
          );
        }
      } catch (error) {
        console.log(`  💥 ${test.description} - Erreur: ${error.message}`);
      }
    }

    console.log("");
  }

  // Résumé
  console.log("📊 Résumé des tests");
  console.log(`   Tests exécutés: ${totalTests}`);
  console.log(`   Tests réussis: ${passedTests}`);
  console.log(`   Tests échoués: ${totalTests - passedTests}`);
  console.log(
    `   Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`
  );

  if (passedTests === totalTests) {
    console.log("\n🎉 Tous les tests de sécurité sont passés !");
    console.log("   Le backend est prêt pour la production.");
  } else {
    console.log("\n⚠️  Certains tests ont échoué.");
    console.log("   Vérifiez la configuration de sécurité.");
    process.exit(1);
  }
};

// Test de création de fichier malveillant
const testMaliciousFile = async () => {
  console.log("\n🔍 Test de détection de fichier malveillant");

  const maliciousContent = '<script>alert("XSS")</script>';
  const testFile = join(process.cwd(), "test-malicious.html");

  try {
    await fs.writeFile(testFile, maliciousContent);

    const analysis = await analyzeFileContent(testFile, "text/html");

    if (!analysis.safe) {
      console.log("  ✅ Fichier malveillant détecté et bloqué");
    } else {
      console.log("  ❌ Fichier malveillant non détecté !");
    }

    // Nettoyer
    await fs.unlink(testFile);
  } catch (error) {
    console.log(`  💥 Erreur lors du test: ${error.message}`);
  }
};

// Exécuter tous les tests
const runAllTests = async () => {
  await runTests();
  await testMaliciousFile();
};

runAllTests().catch((error) => {
  console.error("💥 Erreur lors des tests:", error);
  process.exit(1);
});
