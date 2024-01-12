@echo off
set DOMAIN_NAME=domain1

echo Starting Payara Server domain: %DOMAIN_NAME%
payara6\bin\asadmin start-domain %DOMAIN_NAME%
