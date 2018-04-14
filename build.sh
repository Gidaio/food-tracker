#!/bin/bash

echo Linting TypeScript...
tslint -p .
echo Compiling JavaScript...
tsc -p .
echo Copying HTML...
mkdir -p build/frontend
cp -r src/frontend build
rm build/frontend/*.ts
