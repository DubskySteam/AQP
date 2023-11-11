#!/bin/bash
for i in *.gz
do mv "$i" "${i/.gz}"
done