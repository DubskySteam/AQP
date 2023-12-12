
# SmartSocial Microservice

### Version & Build Info

![](https://img.shields.io/badge/Current%20Version-2.1-green?style=for-the-badge&logo=git)

![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/dubskysteam/AQP/.github%2Fworkflows%2Fgradle.yml?branch=dev&style=for-the-badge&logo=github)

### Stack Info

![](https://img.shields.io/badge/Java%20SDK-17%20LTS-orange?style=for-the-badge&logo=jdk)
![](https://img.shields.io/badge/Jakarta%20EE-9.1.0-green?style=for-the-badge&logo=Jakarta)

![](https://img.shields.io/badge/Gradle-8.4-blue?style=for-the-badge&logo=gradle)
![](https://img.shields.io/badge/PostgreSQL-15.4-blue?style=for-the-badge&logo=postgresql)

___
[![](https://img.shields.io/badge/Download-Latest-blue?style=for-the-badge&logo=)](https://github.com/DubskySteam/AQP/releases)

## Managed Dependencies

The dependencies are managed by Gradle, so you don't need to worry about them. If you need to update a dependency, you can do so by editing the `build.gradle` file.

```groovy
    // JAKARTA DEPENDENCIES
    compileOnly('jakarta.xml.ws:jakarta.xml.ws-api:3.0.1')
    compileOnly('jakarta.platform:jakarta.jakartaee-web-api:9.1.0')
    implementation('org.hibernate:hibernate-core:6.0.2.Final')
    implementation('org.glassfish.jaxb:jaxb-runtime:3.0.2')
    implementation('org.hibernate.validator:hibernate-validator:7.0.5.Final')
    testImplementation 'jakarta.ws.rs:jakarta.ws.rs-api:2.1.6'
    
    // SWAGGER DEPENDENCIES
    implementation group: 'io.swagger.core.v3', name: 'swagger-core-jakarta', version: '2.2.19'
    implementation group: 'io.swagger.core.v3', name: 'swagger-jaxrs2-jakarta', version: '2.2.19'
    implementation group: 'io.swagger.core.v3', name: 'swagger-jaxrs2-servlet-initializer-v2', version: '2.2.19'
    implementation group: 'org.webjars', name: 'swagger-ui', version: '5.9.0'
    
    // MOCKITO DEPENDENCIES
    testImplementation group: 'org.mockito', name: 'mockito-core', version: '5.7.0'
    testImplementation 'org.mockito:mockito-junit-jupiter:5.7.0'
    
    // JUNIT DEPENDENCIES
    testImplementation("org.junit.jupiter:junit-jupiter-params:${junitVersion}")
    testImplementation 'org.assertj:assertj-core:3.17.2'
    testImplementation("org.junit.jupiter:junit-jupiter-api:${junitVersion}")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:${junitVersion}")
    
    // CALCULATION DEPENDENCIES
    implementation group: 'com.javadocmd', name: 'simplelatlng', version: '1.4.0'
```

## Self-Managed Dependencies

````The dependencies are included in the project, but critical updates may be needed to be done manually. ````

    NGI Logger 

## How to use

This microservice uses Gradle as build tool. Most IDEs with Gradle support will allow you to open the build.gradle file and build the entire project from there.

Installing Gradle is not required as the project comes with a Gradle wrapper, but it is recommended to install it to your system anyway, since it can make the build process faster to build by hand.

