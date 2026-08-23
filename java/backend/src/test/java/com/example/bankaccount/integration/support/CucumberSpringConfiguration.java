package com.example.bankaccount.integration.support;

import com.example.bankaccount.service.AccountNotifier;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * Glue class that tells cucumber-spring which Spring context to boot for
 * every scenario in this suite. Picked up automatically because it sits on
 * the glue path configured in RunCucumberIntegrationTest.
 *
 * <p>{@code @MockitoBean} has to sit here, not on a step definition class:
 * Spring's bean-override machinery only scans the class that actually
 * bootstraps the TestContext (this one, via {@code @CucumberContextConfiguration}
 * + {@code @SpringBootTest}). A step class only ever gets ordinary
 * {@code @Autowired} injection from cucumber-spring - an {@code @MockitoBean}
 * field there is silently never overridden, leaving the real bean in place
 * and the step class's own field null.
 */
@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
public class CucumberSpringConfiguration {

    @MockitoBean
    AccountNotifier accountNotifier;
}
