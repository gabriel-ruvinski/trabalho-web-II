package br.ufpr.tads.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI manutencaoOpenApi() {
        return new OpenAPI().info(new Info()
                .title("API de Controle de Manutenção de Equipamentos")
                .version("0.0.1")
                .description("Back-end do trabalho de Desenvolvimento WEB-II (UFPR TADS)."));
    }
}