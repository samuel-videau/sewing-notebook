Team members : Yves ALLARY, May-Line GADONNA, Samuel VIDEAU

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

# Checkpoints report for the project

You **MUST** append a filled copy of this document at the end of your `README.MD`.

This document serves three main purposes:
- providing you a clear list of my expectations (check each point when done) ;
- ensuring I do not miss some of your engineering during the review ;
- asking for additional information that helps me during the review.

## Notice

Check every applicable checkbox in the above list. For each one, provide the requested additional information.

In your explanation, please provide links (file + line) to relevant parts of your source code and tests if applicable.

### Caption

🔵 means the checkbox is mandatory. If missing or absolutely not satisfying, it may cost you 0.5 penalty point.

## Expectations

### GraphQL API only

- [ ] Reduce code duplication for the various involved schemas (of the database, of the ORM, of GraphQL...). **[1 point]** 🔵
> How did you achieve this?

- [ ] Mitigation(s) against too complex GraphQL queries, arbitrary deep nested object fetching or related DoS. **[1 point per mitigation, up to 2]**
> Quote and explain each mitigation.

- [ ] Any security or performance improvement related to your GraphQL implementation, as optionally highlighted in the subject? points]**
> Explain each improvement.

### Input validation

- [x] Strictly and deeply validate the type of every input (`params, querystring, body`) at runtime before any processing. **[1 point]** 🔵
> We used json schemas to validate the input through fastify, in addition to other manual inputs validation

- [x] Ensure the type of every input can be inferred by Typescript at any time and properly propagates across the app. **[1 point]** 🔵
> We used fastify automatic body conversion to our typescript interfaces

- [x] Ensure the static and runtime input types are always synced. **[1 point]** 🔵
> How did you achieve this? If extra commands must be run before the typescript checking, how do you ensure there are run?

### Authorisation

- [x] Check the current user is allowed to call this endpoint. **[1 point]** 🔵
> We used accounts with email/password, providing a JWT token on login. The JWT token needs to be provided in the header as authorization

- [x] Check the current user is allowed to perform the action on a specific resource. **[1 point]** 🔵
> We had a `project_auth` table in our database that aimed to store the users' permissions (eg. user A has the permission to access project A). 
> Several users could have permissions on one project. 
> So each JWT token contained the user Id, so we just had to query this table to verify if he had or not the permission to perform an action on the resource.

- [x] Did you build or use an authorisation framework, making the authorisation widely used in your code base? **[1 point]**
> We used a library to build and verify JWT tokens, but we built the function which is supposed to verify permissions from the JWT.

- [x] Do you have any way to ensure authorisation is checked on every endpoint? **[1 point]**
> It is pretty easy to forget authorising some action.
> For obvious reasons, it may lead to security issues and bugs.
> At work, we use `varvet/pundit` in our `Ruby on Rails` stack. It can raise exception just before answering the client if authorisation is not checked.
> https://github.com/varvet/pundit#ensuring-policies-and-scopes-are-used
> 
> We added permissions tests for each of our routes

### Secret and configuration management

- [x] Use a hash for any sensitive data you do not need to store as plain text. 🔵
> Yes we're doing it using the crypto node library, and hashing passwords using sha-256

- [x] Store your configuration entries in environment variables or outside the git scope. **[1 point]** 🔵
> We did it using dotenv library and different environments such as dev, prod, or test

- [x] Do you provide a way to list every configuration entries (setup instructions, documentation, requireness... are appreciated)? **[1 point]**
> Yes, firstly in the `Getting Started` section of the README.MD, as well as in our `endpoints.ts` file

- [x] Do you have a kind of configuration validation with meaningful error messages? **[1 point]**
> Yes we verify that the configuration file are well loaded, if not, we throw an error

### Package management

- [x] Do not use any package with less than 50k downloads a week. 🔵
> Nope

- [ ] Did you write some automated tools that check no unpopular dependency was installed? If yes, ensure it runs frequently. **[1 point]**
> How did you achieve this? A Github Action (or similar) and compliance rule for pull requests are appreciated.

- [x] Properly use dependencies and devDevepencies in your package.json. **[0.5 points]**
> Yes

### Automated API generation

- [x] Do you have automated documentation generation for your API (such as OpenAPI/Swagger...)? **[1 point]** 🔵
> We used fastify-swagger to automatically generate a swagger page from our app
> You must link your documentation for review (a Github page, a ZIP archive, an attachment to the release notes...).
> You can access it by opening the following file `./swagger/Swagger UI.html`

- [x] In addition to requireness and types, do you provide a comment for every property of your documentation? **[1 point]**
> With fastify-swagger custom properties

- [x] Do you document the schema of responses (at least for success codes) and provide examples of payloads? **[1 point]**
> With fastify-swagger custom properties

- [ ] Is your documentation automatically built and published when a commit reach the develop or master branches? **[1 point]**
> How did you achieve this?

### Error management

- [x] Do not expose internal application state or code (no sent stacktrace in production!). **[1 point]** 🔵
> We only send back to the user custom error messages, and keep original logs internally

- [ ] Do you report errors to Sentry, Rollbar, Stackdriver… **[1 point]**
> How did you achieve this?

### Log management

- [x] Mention everything you put in place for a better debugging experience based on the logs collection and analysis. **[3 points]**
> The only place where logs are triggered are routes, so we're sure to not have double error messages. 
> As well as we're having an env config variable to set the log as on or off. 

- [x] Mention everything you put in place to ensure no sensitive data were recorded to the log. **[1 point]**
> As explained before, logs are always internal, and depend on the env config

### Asynchronous first

- [x] Always use the async implementations when available. **[1 point]** 🔵
> List all the functions you call in their async implementation instead of the sync one.
> 
> Ex: I used `await fs.readFile` in file `folder/xxx.ts:120` instead of `fs.readFileSync`.

- [x] No unhandled promise rejections, no uncaught exceptions… **[1 point]** 🔵
> We used a try catch over all our routes, and we're using eslint to verify our code

### Code quality

- [x] Did you put a focus on reducing code duplication? **[1 point]**
> We did that by creating a `bin` folder, containing all the reusable code, with for example, a log of `utils` functions.
> We even created a `error-messages.ts` to avoid re-writing all the error messages

- [ ] Eslint rules are checked for any pushed commit to develop or master branch. **[1 point]**
> Please provide a link to the sample of  logs (or similar).

### Automated tests

- [x] You implemented automated specs. **[1 point]** 🔵
> Please provide a link to the more complete summary you have.

- [x] Your test code coverage is 75% or more.  **[1 point]** 🔵
> Report can be visualized here: ``/sewing-notebook/coverage/lcov-report/index.html``

- [ ] Do you run the test on a CD/CI, such as Github Action? **[1 point]**
> Please provide a link to the latest test summary you have, hosted on Github Action or similar.
