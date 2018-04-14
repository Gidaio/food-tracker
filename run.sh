#!/bin/bash

clear

echo Building...
./build.sh

if [ "$1" = "--destroy" ] && [ -e build/database.db ]; then
    echo Destroying database...
    rm build/database.db
fi

if [ -e build/out.log ]; then
    echo Resetting log...
    rm build/out.log
fi

echo Running...
node build/app.js
