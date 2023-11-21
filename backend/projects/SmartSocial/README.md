
# SmartSocial Microservice

### Version & Build Info

![](https://img.shields.io/badge/Current%20Version-1.0.0-green?style=for-the-badge&logo=git)

![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/dubskysteam/FFXIV-RaidCompletion/.github%2Fworkflows%2Frust.yml?style=for-the-badge)

### Stack Info

![](https://img.shields.io/badge/Java%20SDK-17-orange?style=for-the-badge&logo=jdk)
![](https://img.shields.io/badge/Jakarta%20EE-9.1.0-green?style=for-the-badge&logo=Jakarta)

![](https://img.shields.io/badge/Gradle-8.4-blue?style=for-the-badge&logo=gradle)
![](https://img.shields.io/badge/PostgreSQL-15.4-blue?style=for-the-badge&logo=postgresql)


___
[![](https://img.shields.io/badge/Download-Latest-blue?style=for-the-badge&logo=)](https://github.com/DubskySteam/AQP/releases)

## Managed Dependencies

```The dependencies are managed by Gradle, so you don't need to worry about them. If you need to update a dependency, you can do so by editing the build.gradle file. ```

    Hibernate -> org.hibernate:hibernate-core:6.0.2.Final
    Hibernate Validator -> org.glassfish.jaxb:jaxb-runtime:3.0.2
    Jakarta Web API -> org.glassfish.jaxb:jaxb-runtime:3.0.2
    Jakarta WS API -> org.glassfish.jaxb:jaxb-runtime:3.0.2
    Glassfish XML Bindings -> org.glassfish.jaxb:jaxb-runtime:3.0.2

## Self-Managed Dependencies

````The dependencies are included in the project, but critical updates may be needed to be done manually. ````

    NGI Logger 

## How to use

This microservice uses Gradle as build tool. Most IDEs with Gradle support will allow you to open the build.gradle file and build the entire project from there.

Installing Gradle is not required as the project comes with a Gradle wrapper, but it is recommended to install it to your system anyway, since it can make the build process faster to build by hand.
