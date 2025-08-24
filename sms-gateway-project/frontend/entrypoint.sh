#!/bin/sh

# Replace placeholders with actual API URLs
sed -i "s|\$ADMIN_API_BASE_URL|$ADMIN_API_BASE_URL|g" /etc/nginx/conf.d/default.conf
sed -i "s|\$API_BASE_URL|$API_BASE_URL|g" /etc/nginx/conf.d/default.conf

exec "$@"