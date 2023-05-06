#!/bin/bash

# shellcheck disable=SC2164
cd /SERVICE

CONFIG_ARGS="s|CONFIG_SERVER_HOST|${CONFIG_SERVER_HOST}|g;\
            s|CONFIG_SERVER_PORT|${CONFIG_SERVER_PORT}|g;\
        	s|CONFIG_API_PREFIX|${CONFIG_API_PREFIX}|g;\
        	s|CONFIG_WHITELIST_IPS|${CONFIG_WHITELIST_IPS}|g;\
        	s|CONFIG_POSTGRES_HOST|${CONFIG_POSTGRES_HOST}|g;\
        	s|CONFIG_POSTGRES_PORT|${CONFIG_POSTGRES_PORT}|g;\
        	s|CONFIG_POSTGRES_USERNAME|${CONFIG_POSTGRES_USERNAME}|g;\
        	s|CONFIG_POSTGRES_PASSWORD|${CONFIG_POSTGRES_PASSWORD}|g;\
        	s|CONFIG_POSTGRES_DB_NAME|${CONFIG_POSTGRES_DB_NAME}|g;\
        	s|CONFIG_POSTGRES_TESTING_DB|${CONFIG_POSTGRES_TESTING_DB}|g;\
        	s|CONFIG_SECRET_SIGN_KEY|${CONFIG_SECRET_SIGN_KEY}|g;\
        	s|CONFIG_ACCESS_TOKEN_SECRET|${CONFIG_ACCESS_TOKEN_SECRET}|g;\
        	s|CONFIG_REFRESH_TOKEN_SECRET|${CONFIG_REFRESH_TOKEN_SECRET}|g;\
        	s|CONFIG_REDIS_HOST|${CONFIG_REDIS_HOST}|g;\
        	s|CONFIG_REDIS_PORT|${CONFIG_REDIS_PORT}|g;\
        	s|CONFIG_REDIS_PASSWORD|${CONFIG_REDIS_PASSWORD}|g;\
        	s|CONFIG_REDIS_DB|${CONFIG_REDIS_DB}|g;\
        	s|CONFIG_TWILIO_ACCOUNT_SID|${CONFIG_TWILIO_ACCOUNT_SID}|g;\
        	s|CONFIG_TWILIO_AUTH_TOKEN|${CONFIG_TWILIO_AUTH_TOKEN}|g;\
        	s|CONFIG_TWILIO_PHONE_NUMBER|${CONFIG_TWILIO_PHONE_NUMBER}|g\
        	s|CONFIG_AWS_ACCESS_KEY|${CONFIG_AWS_ACCESS_KEY}|g;\
        	s|CONFIG_AWS_SECRET_KEY|${CONFIG_AWS_SECRET_KEY}|g;\
        	s|CONFIG_AWS_REGION|${CONFIG_AWS_REGION}|g;\
        	s|CONFIG_AWS_S3_BUCKET|${CONFIG_AWS_S3_BUCKET}|g"

sed -i -e "$CONFIG_ARGS" .env

yarn start

exec "$@"