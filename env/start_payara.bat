@echo off
set PAYARA_HOME=payara6
set DOMAIN_NAME=domain1

%PAYARA_HOME%\bin\asadmin list-domains | findstr /C:"%DOMAIN_NAME% running"
if %ERRORLEVEL% == 0 (
    echo Stopping Payara Server domain: %DOMAIN_NAME%
    %PAYARA_HOME%\bin\asadmin stop-domain %DOMAIN_NAME%
) else (
    echo Starting Payara Server domain: %DOMAIN_NAME%
    %PAYARA_HOME%\bin\asadmin start-domain %DOMAIN_NAME%
)
