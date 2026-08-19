package com.example.bankaccount.integration.support;

import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Glue class that tells cucumber-spring which Spring context to boot for
 * every scenario in this suite. Picked up automatically because it sits on
 * the glue path configured in RunCucumberIntegrationTest.
 */
@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
public class CucumberSpringConfiguration {
}
