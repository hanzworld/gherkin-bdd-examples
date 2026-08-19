package com.example.bankaccount.integration;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;

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
public class RunCucumberIntegrationTest {
}
