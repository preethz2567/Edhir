package com.edhir.testapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@ComponentScan(basePackages = {"com.edhir.testapp", "com.edhir.proxy"})
@EntityScan(basePackages = {"com.edhir.proxy.entity"})
@EnableJpaRepositories(basePackages = {"com.edhir.proxy.repository"})
@RestController
public class TestApplication {

    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello from Test App!";
    }
}
