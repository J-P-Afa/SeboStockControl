#!/bin/bash

# Exit on any error
set -e

echo "Running Backend Unit Tests..."
cd backend
npm test
cd ..

echo ""
echo "Running Frontend Unit Tests..."
cd frontend
npm test
cd ..

echo ""
echo "All unit tests passed successfully!"
