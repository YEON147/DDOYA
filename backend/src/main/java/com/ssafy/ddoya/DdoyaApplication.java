package com.ssafy.ddoya;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class DdoyaApplication {

	public static void main(String[] args) { 
		SpringApplication.run(DdoyaApplication.class, args);
	}

}
