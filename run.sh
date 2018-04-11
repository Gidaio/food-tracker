#!/bin/bash

clear

echo Building...
./build.sh

if [ $1 = "destroy" ] && [ -e build/database.db ]
then
    echo Destroying database...
    rm build/database.db
fi

echo Running...
node build/app.js
