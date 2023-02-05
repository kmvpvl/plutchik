#!/bin/bash
mongodump -d PLUTCHIK -o database
mongorestore --drop database/
