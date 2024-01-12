#!/bin/bash
PAYARA_HOME=payara6
DOMAIN_NAME=domain1

echo "Starting Payara Server domain: $DOMAIN_NAME"
$PAYARA_HOME/bin/asadmin start-domain $DOMAIN_NAME
