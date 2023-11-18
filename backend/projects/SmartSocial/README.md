
# SmartSocial Microservice

### Version & Build Info

![](https://img.shields.io/badge/Current%20Version-1.0.0-green?style=for-the-badge&logo=git)

![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/dubskysteam/FFXIV-RaidCompletion/.github%2Fworkflows%2Frust.yml?style=for-the-badge)

### Stack Info

![](https://img.shields.io/badge/Java%20SDK-17-orange?style=for-the-badge&logo=jdk)
![](https://img.shields.io/badge/Spring-3.1.5-green?style=for-the-badge&logo=spring)

![](https://img.shields.io/badge/Gradle-8.4-blue?style=for-the-badge&logo=gradle)
![](https://img.shields.io/badge/PostgreSQL-15.4-blue?style=for-the-badge&logo=postgresql)


___
[![](https://img.shields.io/badge/Download-Latest-blue?style=for-the-badge&logo=)](https://github.com/DubskySteam/AQP/releases)

## Managed Dependencies

```The dependencies are managed by Gradle, so you don't need to worry about them. If you need to update a dependency, you can do so by editing the build.gradle file. ```

    Spring JPA -> spring-boot-starter-data-jpa
	Spring REST -> spring-boot-starter-web
    Spring Test -> org.springframework.boot:spring-boot-starter-test
    Lombok -> org.projectlombok:lombok
    PostgreSQL -> org.postgresql:postgresql
    Tomcat Webserver -> org.springframework.boot:spring-boot-starter-tomcat

## Self-Managed Dependencies

````The dependencies are included in the project, but critical updates may be needed to be done manually. ````

## How to use

This microservice uses Gradle as build tool. Most IDEs with Gradle support will allow you to open the build.gradle file and build the entire project from there.

Installing Gradle is not required as the project comes with a Gradle wrapper, but it is recommended to install it to your system anyway, since it can make the build process faster to build by hand.
