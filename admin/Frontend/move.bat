@echo off
set "targetDir=C:\Users\cmaas\GitHub\AQ\env\payara6\glassfish\domains\domain1\docroot\Admin"
if not exist "%targetDir%" mkdir "%targetDir%"
for /d %%d in (*) do xcopy "%%d" "%targetDir%\%%d\" /E /I /Y
for %%f in (*) do if not "%%~xf"==".bat" if not "%%~xf"==".sh" copy "%%f" "%targetDir%"
