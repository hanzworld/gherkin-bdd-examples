package com.example.bankaccount.unit;

import static io.cucumber.junit.platform.engine.Constants.FILTER_TAGS_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.OBJECT_FACTORY_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features/unit")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.example.bankaccount.unit.steps")
// @manual scenarios have no automated implementation - see
// scripts/find-manual-tests.mjs and the ManualApproval pipeline stage.
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "not @manual")
// cucumber-spring is also on the test classpath (for the integration suite)
// and, left to its own devices, Cucumber tries every registered
// ObjectFactory - including Spring's - for every suite. This one has no
// @CucumberContextConfiguration glue class (deliberately: "no Spring
// context, no DI container"), so SpringFactory.start() throws unless we
// pin this suite to the plain reflection-based factory.
@ConfigurationParameter(
        key = OBJECT_FACTORY_PROPERTY_NAME,
        value = "io.cucumber.core.backend.DefaultObjectFactory")
// Surefire's own XML report for a @Suite class shows 0 tests (it doesn't
// unroll the nested Cucumber engine's dynamic tests) - Cucumber's own JUnit
// XML formatter reports per-scenario results correctly, so the pipeline
// publishes this file instead of the surefire-reports one for this suite.
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "junit:target/cucumber-reports/unit.xml")
public class RunCucumberUnitTest {
}
