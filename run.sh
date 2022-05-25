#!/bin/bash

printTimestamp(){
echo $(date "+%d/%m/%Y %H:%M:%S")
}

echo "$(printTimestamp) | -- Executing AETO - event to calendar... --"
npm run start
echo "$(printTimestamp) | -- End --"
echo ""

