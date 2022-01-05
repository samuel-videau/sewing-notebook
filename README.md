# sewing-notebook

## Abstract

We are creating a sewing stash manager to follow the quantity of sewing supplies while doing projects. Some supplies will be for personnal use only, while other supplies may be shared between several users.

## Features

### Stock Management

- Create an entry for a specific sewing supply
- Edit the quantity of a supply to follow the availabilities
- Grant access to supply to users

### Project Management

- Create a project with a supply list
- Create a dynamic todo (consume supply depending on actions)

## Getting started

### Create firebase projects

- You need to create two firebase projects (one for dev and one for test)
- Create service accounts for each from google cloud platform and create keys for each using JSON format
- Rename JSON files as sewing-notebook-service-account, sewing-notebook-service-account-test and add it into your `src/environment`
