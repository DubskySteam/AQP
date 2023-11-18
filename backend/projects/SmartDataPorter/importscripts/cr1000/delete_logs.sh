#!/bin/bash

for i in *.gz
do mv "$i" "${i/.gz}"
done

echo "======= start ======="
 
while [ "$Filetype" != "end" ]
do
    echo "Filetype to delete: "
    read Filetype
 
    if [ "$Filetype" != "end" ]
    then
        # ---- deleting ----
        find . -name "*.$Filetype" -exec rm -vf {} \;
    fi
done
 
echo "======= finished ======="