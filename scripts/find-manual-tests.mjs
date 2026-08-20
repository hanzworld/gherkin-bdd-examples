#!/usr/bin/env node
// Scans every .feature file in the repo for scenarios tagged @manual (a
// scenario with no automated implementation - it has to be run by a human)
// and writes a checklist + machine-readable summary for the pipeline to
// publish and gate on. See azure-pipelines.yml (DetectManualTests stage).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEARCH_DIRS = ["csharp", "java"];
const SKIP_DIR_NAMES = new Set(["node_modules", "bin", "obj", "target", ".git"]);
const MANUAL_TAG = "@manual";

function findFeatureFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      results.push(...findFeatureFiles(path.join(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith(".feature")) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

// Deliberately simple line-based scan rather than a full Gherkin parser -
// good enough for the plain, single-feature-per-file style used in this repo.
function parseFeatureFile(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const scenarios = [];
  let featureTitle = null;
  let featureTags = [];
  let pendingTags = [];
  let current = null;

  const flush = () => {
    if (current) scenarios.push(current);
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("@")) {
      pendingTags.push(...line.split(/\s+/).filter(Boolean));
      continue;
    }

    const featureMatch = line.match(/^Feature:\s*(.*)$/);
    if (featureMatch) {
      featureTitle = featureMatch[1].trim();
      featureTags = pendingTags;
      pendingTags = [];
      continue;
    }

    const scenarioMatch = line.match(/^Scenario(?: Outline)?:\s*(.*)$/);
    if (scenarioMatch) {
      flush();
      current = {
        name: scenarioMatch[1].trim(),
        tags: [...featureTags, ...pendingTags],
        steps: [],
      };
      pendingTags = [];
      continue;
    }

    const stepMatch = line.match(/^(Given|When|Then|And|But)\s+(.*)$/);
    if (stepMatch && current) {
      current.steps.push(`${stepMatch[1]} ${stepMatch[2]}`);
    }
  }
  flush();

  return scenarios
    .filter((s) => s.tags.includes(MANUAL_TAG))
    .map((s) => ({
      file: path.relative(ROOT, filePath),
      feature: featureTitle,
      scenario: s.name,
      steps: s.steps,
    }));
}

function main() {
  const outDir = path.resolve(process.argv[2] ?? path.join(ROOT, "manual-tests-output"));
  fs.mkdirSync(outDir, { recursive: true });

  const manualScenarios = SEARCH_DIRS
    .map((dir) => path.join(ROOT, dir))
    .filter((dir) => fs.existsSync(dir))
    .flatMap((dir) => findFeatureFiles(dir))
    .sort()
    .flatMap((file) => parseFeatureFile(file));

  const scenariosWithIds = manualScenarios.map((s, i) => ({
    id: `MT-${String(i + 1).padStart(3, "0")}`,
    ...s,
  }));

  const summary = { count: scenariosWithIds.length, scenarios: scenariosWithIds };
  fs.writeFileSync(
    path.join(outDir, "manual-test-summary.json"),
    JSON.stringify(summary, null, 2) + "\n"
  );

  const md = [];
  md.push("# Manual test checklist");
  md.push("");
  if (scenariosWithIds.length === 0) {
    md.push("No scenarios are tagged `@manual` for this run.");
  } else {
    md.push(
      `${scenariosWithIds.length} scenario(s) are tagged \`@manual\` and have no automated ` +
        "test. Run each one by hand, then record the result in the pipeline's manual " +
        "approval step (see the pipeline run for instructions)."
    );
    md.push("");
    md.push(
      "When recording results, use the scenario ID shown below, e.g. `MT-001: PASS` or " +
        "`MT-001: FAIL - <what went wrong>`."
    );
    for (const s of scenariosWithIds) {
      md.push("");
      md.push(`## ${s.id}: ${s.scenario}`);
      md.push("");
      md.push(`- **Feature:** ${s.feature}`);
      md.push(`- **File:** \`${s.file}\``);
      if (s.steps.length > 0) {
        md.push("");
        for (const step of s.steps) md.push(`  ${step}`);
      }
    }
  }
  md.push("");
  fs.writeFileSync(path.join(outDir, "manual-test-checklist.md"), md.join("\n"));

  console.log(`Found ${scenariosWithIds.length} manual scenario(s).`);
  for (const s of scenariosWithIds) {
    console.log(`  ${s.id}: ${s.scenario} (${s.file})`);
  }
  console.log(`Wrote ${outDir}/manual-test-checklist.md`);
  console.log(`Wrote ${outDir}/manual-test-summary.json`);
}

main();
