#!/bin/sh

# Replace placeholder with actual API URL
sed -i "s|\$VITE_API_BASE_URL|$VITE_API_BASE_URL|g" /etc/nginx/conf.d/default.conf

exec "$@"