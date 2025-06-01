# CI/CD Configuration for Thesis Learning App

This directory contains GitHub Actions workflows for Continuous Integration and Continuous Deployment of the project.

## Workflows

### 1. CI (Continuous Integration)
File: `.github/workflows/ci.yml`

This workflow runs on every push and pull request to the `main` and `develop` branches, and performs:
- Linting checks
- Unit tests
- Integration tests with DynamoDB local
- End-to-end tests with Playwright

### 2. CD (Continuous Deployment)
File: `.github/workflows/cd.yml`

This workflow runs on every push to the `main` branch and:
- Verifies code quality with linting and tests
- Builds the application
- Deploys to production (AWS example included)

You can also trigger it manually via GitHub's "workflow_dispatch" event.

### 3. Dependency Updates
File: `.github/workflows/dependency-updates.yml`

This workflow runs weekly and creates a PR to update dependencies:
- Runs every Monday at midnight
- Updates all dependencies to their latest versions
- Creates a pull request against the `develop` branch

## Setup Required

1. Add the following secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`

2. Customize the deployment steps in `cd.yml` based on your deployment target (AWS S3, EC2, ECS, etc.).

## Manual Triggers

You can manually trigger the CD and Dependency Updates workflows from the GitHub Actions tab in your repository. 