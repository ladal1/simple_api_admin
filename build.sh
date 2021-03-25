#!/usr/bin/env bash

# Clean previous run
rm -r build
cd src/react
# run npm in respective folder
npm install
# React build and make into django template
npm run djangofy
# return home
cd ../..

# New build
mkdir build
# Copy python module part
cp -avr src/python/. build
# Copy react build static files
cp -avr src/react/build/static build/simple_api_admin/static
# Copy template file
cp -av src/react/build/index.html build/simple_api_admin/templates/index.html
# Remove unnecessary .gitkeep
rm build/simple_api_admin/templates/.gitkeep
