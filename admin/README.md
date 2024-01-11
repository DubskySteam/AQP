# Admin Panel

### Version & Stack Info

![](https://img.shields.io/badge/Web%20Version-2.4-green?style=for-the-badge&logo=git)
![](https://img.shields.io/badge/API%20Version-1.4-green?style=for-the-badge&logo=git)

### Stack Info

![](https://img.shields.io/badge/Java%20SDK-17%20LTS-orange?style=for-the-badge&logo=jdk)
![](https://img.shields.io/badge/Jakarta%20EE-9.1.0-green?style=for-the-badge&logo=Jakarta)

![](https://img.shields.io/badge/Gradle-8.4-blue?style=for-the-badge&logo=gradle)

## Use Case

As the payara server admin panel is not very user friendly, this project aims to provide a more user friendly interface that also provides some additional features for specific use cases like the SmartSocial Microservice.

## Features

- [X] Customizable API Endpoint Checker
- [X] Customizable API Endpoint Debugger
- [X] Automatic API Documentation reliant on Swaggers OpenAPI Specification
- [X] Payara Manager: View and re-deploy applications
- [X] Payara Manager: View raw and parsed logs
- [X] SmartSocial Microservice: View and edit the database

## How to: Build (IDE)

1. Clone the repository
2. Open the build.gradle file in your IDE
3. Run the `build` gradle task if your IDE supports it
4. Deploy the .war file to your payara server (Context root: `/admin` preferred)
   Run the move.bat or move.sh script to move the static files to the payara server document root
   
    **Note:** The move script has a static path to the payara server document root. If you are using a different folder structure, you will have to change the path in the script.


## How to: Build (no IDE)

1. Clone the repository
2. Run `gradlew build` in the root directory of the project
3. The .war file will be located in `build/libs`
4. Deploy the .war file to your payara server (Context root: `/admin` preferred)
   Run the move.bat or move.sh script to move the static files to the payara server document root
   
    **Note:** The move script has a static path to the payara server document root. If you are using a different folder structure, you will have to change the path in the script.

## How to: Install (Binary)

1. Download the latest .zip from the releases page
2. Extract the .zip to a folder of your choice
3. Deploy the .war file to your payara server (Context root: `/admin` preferred)
4. Run the move.bat or move.sh script to move the static files to the payara server document root
   
    **Note:** The move script has a static path to the payara server document root. If you are using a different folder structure, you will have to change the path in the script.

## Fast deployment using shell scripts
Deploying applications through the web-interface is slow and frustrating.
Edit the 'deploy.sh' (if linux) or 'deploy.bat' (if windows) and change the paths.
After you build the application you can now just run the script, which will deploy it for you.

## Bugs and known issues

- Nothing noteworthy at the moment
