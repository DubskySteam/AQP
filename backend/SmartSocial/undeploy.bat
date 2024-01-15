@echo off

SET "PATH_TO_PAYARA_BIN=..\..\env\payara6\bin"
SET "PATH_TO_WAR=build\libs\SmartSocial-2.2.war"

"%PATH_TO_PAYARA_BIN%\asadmin" undeploy "%PATH_TO_WAR%"
