#!/bin/bash
PAYARA_HOME=payara6
DOMAIN_NAME=domain1

if $PAYARA_HOME/bin/asadmin list-domains | grep -q "$DOMAIN_NAME running"; then
    echo "Stopping Payara Server domain: $DOMAIN_NAME"
    $PAYARA_HOME/bin/asadmin stop-domain $DOMAIN_NAME
else
    echo "Starting Payara Server domain: $DOMAIN_NAME"
    $PAYARA_HOME/bin/asadmin start-domain $DOMAIN_NAME
fi

