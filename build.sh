#!/usr/bin/env bash

rm -r build
cd src/react
npm install
npm run djangofy
cd ../..
mkdir build

cp -ar src/python/. build
cp -ar src/react/build/static build/simple_api_admin/static
cp -a src/react/build/index.html build/simple_api_admin/templates/index.html