package com.example.bankaccount.integration;

import static io.cucumber.junit.platform.engine.Constants.FILTER_TAGS_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features/integration")
@ConfigurationParameter(
        key = GLUE_PROPERTY_NAME,
        value = "com.example.bankaccount.integration.steps,com.example.bankaccount.integration.support")
// @manual scenarios have no automated implementation - see
// scripts/find-manual-tests.mjs and the ManualApproval pipeline stage.
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "not @manual")
// Surefire's own XML report for a @Suite class shows 0 tests (it doesn't
// unroll the nested Cucumber engine's dynamic tests) - Cucumber's own JUnit
// XML formatter reports per-scenario results correctly, so the pipeline
// publishes this file instead of the surefire-reports one for this suite.
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "junit:target/cucumber-reports/integration.xml")
public class RunCucumberIntegrationTest {
}
