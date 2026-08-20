#!/usr/bin/env node
// Runs after the ManualApproval stage's environment gate has been resumed.
// Pulls the approver's comment back out of Azure DevOps via the Pipelines
// REST API, matches "MT-001: PASS" / "MT-001: FAIL - notes" lines in it
// against the manual-test-summary.json produced by find-manual-tests.mjs,
// and writes a results artifact - markdown, JSON, and a JUnit XML file so
// PublishTestResults@2 can put manual scenarios in Azure DevOps's Tests tab
// next to the automated results.
//
// NOTE: the Approvals REST API is one of the less-documented corners of
// Azure DevOps. This is best-effort - if it can't find/parse a comment, it
// still writes results files explaining that (every scenario marked as a
// failure so it can't silently disappear from the Tests tab), and the
// pipeline step that calls this is wrapped in continueOnError so a change
// in the API surface doesn't hard-fail the run. The authoritative record is
// always the Approvals panel on the pipeline run itself.

import fs from "node:fs";
import path from "node:path";

function arg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? process.argv[idx + 1] : fallback;
}

const collectionUri = arg("org", process.env.SYSTEM_COLLECTIONURI);
const project = arg("project", process.env.SYSTEM_TEAMPROJECT);
const buildId = arg("build-id", process.env.BUILD_BUILDID);
const summaryPath = arg("summary");
const outDir = path.resolve(arg("out", "manual-test-results-output"));
const token = process.env.SYSTEM_ACCESSTOKEN;

fs.mkdirSync(outDir, { recursive: true });

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildJUnitXml(rows) {
  const failures = rows.filter((r) => r.status !== "PASS").length;
  const testcases = rows
    .map((r) => {
      const name = escapeXml(`${r.id}: ${r.scenario}`);
      const classname = escapeXml(r.feature ?? "Manual tests");
      if (r.status === "PASS") {
        return `    <testcase classname="${classname}" name="${name}" />`;
      }
      const message =
        r.status === "NOT RECORDED"
          ? "No result recorded in the approval comment"
          : escapeXml(r.notes || "Manual test failed");
      return (
        `    <testcase classname="${classname}" name="${name}">\n` +
        `      <failure message="${message}">${message}</failure>\n` +
        `    </testcase>`
      );
    })
    .join("\n");

  return (
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<testsuites name="Manual Tests" tests="${rows.length}" failures="${failures}">`,
      `  <testsuite name="Manual tests" tests="${rows.length}" failures="${failures}">`,
      testcases,
      "  </testsuite>",
      "</testsuites>",
    ].join("\n") + "\n"
  );
}

// scenarios (optional): the summary's scenario list, if we got far enough to
// load it, so we can still put every manual scenario in the Tests tab
// (marked as a failure explaining why) instead of it just disappearing.
function writeFallback(reason, scenarios) {
  const md = [
    "# Manual test results",
    "",
    `Could not automatically retrieve the approval comment: ${reason}`,
    "",
    "Check the **Approvals** panel on this pipeline run in Azure DevOps for the ",
    "authoritative record of who approved manual testing and what they entered.",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(outDir, "manual-test-results.md"), md);
  fs.writeFileSync(
    path.join(outDir, "manual-test-results.json"),
    JSON.stringify({ captured: false, reason }, null, 2) + "\n"
  );

  if (scenarios && scenarios.length > 0) {
    const rows = scenarios.map((s) => ({
      id: s.id,
      scenario: s.scenario,
      feature: s.feature,
      status: "NOT RECORDED",
      notes: reason,
    }));
    fs.writeFileSync(path.join(outDir, "manual-test-results.xml"), buildJUnitXml(rows));
  }

  console.log(`Could not capture approval comment automatically: ${reason}`);
}

async function main() {
  if (!summaryPath || !fs.existsSync(summaryPath)) {
    writeFallback(`manual-test-summary.json not found at ${summaryPath}`, null);
    return;
  }
  const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));

  if (!collectionUri || !project || !buildId) {
    writeFallback("missing org/project/build-id", summary.scenarios);
    return;
  }
  if (!token) {
    writeFallback(
      "SYSTEM_ACCESSTOKEN not available (enable 'Allow scripts to access OAuth token' on this pipeline)",
      summary.scenarios
    );
    return;
  }

  const authHeader = "Basic " + Buffer.from(":" + token).toString("base64");
  const base = collectionUri.replace(/\/$/, "");

  const listUrl = `${base}/${project}/_apis/pipelines/approvals?$expand=steps&api-version=7.1-preview.1`;
  const res = await fetch(listUrl, { headers: { Authorization: authHeader } });
  if (!res.ok) {
    writeFallback(`approvals API returned HTTP ${res.status}`, summary.scenarios);
    return;
  }

  const body = await res.json();
  const approvals = (body.value ?? []).filter(
    (a) => String(a.pipeline?.run?.id ?? a.pipeline?.runId ?? "") === String(buildId)
  );

  if (approvals.length === 0) {
    writeFallback(`no approval found for build ${buildId}`, summary.scenarios);
    return;
  }

  const results = [];
  for (const approval of approvals) {
    for (const step of approval.steps ?? []) {
      results.push({
        approver: step.assignedApprover?.displayName ?? "unknown",
        status: step.status,
        comment: step.comment ?? "",
      });
    }
  }

  const commentText = results.map((r) => r.comment).filter(Boolean).join("\n");
  // Horizontal whitespace only around each part - \s would also match the
  // newline separating lines and bleed the next line's text into this one's
  // notes capture (confirmed by testing against a two-line comment).
  const lineRe = /(MT-\d{3})[ \t]*:[ \t]*(PASS|FAIL)\b[ \t]*-?[ \t]*(.*)/gi;
  const scenarioResults = new Map();
  let match;
  while ((match = lineRe.exec(commentText)) !== null) {
    const [, id, status, notes] = match;
    scenarioResults.set(id.toUpperCase(), { status: status.toUpperCase(), notes: notes.trim() });
  }

  const rows = summary.scenarios.map((s) => {
    const recorded = scenarioResults.get(s.id);
    return {
      id: s.id,
      scenario: s.scenario,
      feature: s.feature,
      file: s.file,
      status: recorded?.status ?? "NOT RECORDED",
      notes: recorded?.notes ?? "",
    };
  });

  const md = [];
  md.push("# Manual test results");
  md.push("");
  md.push(`Captured from ${results.length} approval response(s) on build ${buildId}.`);
  md.push("");
  md.push("| ID | Scenario | Status | Notes |");
  md.push("|---|---|---|---|");
  for (const r of rows) {
    md.push(`| ${r.id} | ${r.scenario} | ${r.status} | ${r.notes} |`);
  }
  md.push("");
  md.push("## Approvers");
  md.push("");
  for (const r of results) {
    md.push(`- **${r.approver}** (${r.status})${r.comment ? `: ${r.comment}` : ""}`);
  }
  md.push("");

  fs.writeFileSync(path.join(outDir, "manual-test-results.md"), md.join("\n"));
  fs.writeFileSync(
    path.join(outDir, "manual-test-results.json"),
    JSON.stringify({ captured: true, buildId, approvals: results, scenarios: rows }, null, 2) + "\n"
  );
  fs.writeFileSync(path.join(outDir, "manual-test-results.xml"), buildJUnitXml(rows));

  console.log(`Captured manual test results for ${rows.length} scenario(s).`);
  const unrecorded = rows.filter((r) => r.status === "NOT RECORDED");
  if (unrecorded.length > 0) {
    console.log(`WARNING: ${unrecorded.length} scenario(s) had no matching MT-xxx line in the approval comment.`);
  }
}

main().catch((err) => writeFallback(err.message, null));
