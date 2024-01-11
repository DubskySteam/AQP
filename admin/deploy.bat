@echo off

SET "PATH_TO_PAYARA_BIN=%USERPROFILE%\Downloads\SmartDeveloper\software\payara6\bin"
SET "CONTEXT_ROOT=/admin"
SET "PATH_TO_WAR=Backend\build\libs\admin-1.4.war"

"%PATH_TO_PAYARA_BIN%\asadmin" deploy --contextroot "%CONTEXT_ROOT%" "%PATH_TO_WAR%"
