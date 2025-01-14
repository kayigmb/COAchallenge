#!/bin/bash

# creates the env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo ".env file created";
else 
    echo ".env file already exists";
fi

# creates the versions alembic
if [ ! -d ./migrations/versions ]; then
   mkdir ./migrations/versions/;
   echo "Alembic versions Created";
else
    echo "Version already exists";
fi

# installs dependencies
poetry lock
poetry install;
