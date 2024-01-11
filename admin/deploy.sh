#!/bin/bash
PATH_TO_PAYARA_BIN="~/Downloads/SmartDeveloper/software/payara6/bin"
CONTEXT_ROOT="/admin"
PATH_TO_WAR="Backend/build/libs/admin-1.4.war"
exec "${PATH_TO_PAYARA_BIN}/asadmin" deploy --contextroot "${CONTEXT_ROOT}" "${PATH_TO_WAR}"
