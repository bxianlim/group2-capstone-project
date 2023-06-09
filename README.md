# (SCTP) Cloud Infrastructure Enginerring Capstone Project Documentation
## Case 1 - CI/CD Pipeline
### Group 2 - Taufiq, Bing Xian & Liau
\  
\
# Company Profile
AutomateTech Solutions is a cutting-edge startup specializing in DevOps automation and cloud-native solutions. Our team of highly skilled software engineers and DevOps experts is dedicated to streamlineing the release cycle process and enabling rapid and efficient deployment of our software applications.

# DevOps Mission Statement
Our mission is to accelerate software deployment using CI/CD Pipeline so that each release cycle can ne released quickly from the development environment, to staging environment and to production environment.

# CI/CP Pipeline Overview

<image>

# Branching Strategy
As the company is going at a fast pace growth rhythm, there will be more engineers onboarding in the next few quaters. As such we need to ensure that as the team size grows, the release pipeline is well controlled. Keeping with these demands in mind, we are building a DevOps cycle with the this branching strategy:

1. All **features** branches must be merged into **dev** branch.
2. **staging** branch must be merged from **dev** branch.
3. **main** branch must be merged from **staging** branch.

The following diagram illustrate this branching strategy:
<image>

# Branch Creation
Branch can be created from GitHub repository or command line. Below are the command line to create the desired branches for our CI/CD Pipeline:

```sh
$ git checkout -b dev
$ git push origin dev
```

```sh
$ git checkout -b staging
$ git push origin staging
```

```sh
$ git checkout -b feature
$ git push origin feature
```

## Branch protection
In order to implement the above mentioned branching strategy we create branch protection rule in the GitHub repository as follows:

<image 1>
<image 2>

With the branch protection rule applied direct commit to **dev**, **stage** & **main** branch will be rejected as shown below:
```sh
$ git push
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 16 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 1.33 KiB | 1.33 MiB/s, done.
Total 3 (delta 1), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
remote: error: GH006: Protected branch update failed for refs/heads/dev.
remote: error: Changes must be made through a pull request.
To GitHub.com:bxianlim/group2-capstone-project.git
 ! [remote rejected] dev -> dev (protected branch hook declined)
error: failed to push some refs to 'GitHub.com:bxianlim/group2-capstone-project.git'
```

The branch protection rule ensure that all commits to **dev**, **staging** & **main** branch must be made to a non-protected branch (i.e. feature branch) and submitted via a pull request. In addition each pull request require approvals. Merging will be blocked until the pull request is reviewed and approved by someone else other than the person who created the pull request.

<image>

# Serverless Application
This CI/CD Pipeline automate the deployment of a serverless application with AWS **Lambda** serverless compute service. AWS **Lambda** allow us to run code without provisoning or managing infrastruture. This kind of AWS service is well suited for a startup company like us to save costs by paying only for the compute time we use -- *by per-millisecond* -- instead of provisioning infrastructure upfron for peak capacity.

## These are the steps to create the serverless application

### Step 1: Create index.js file -- *this is the main application code*
<image>

[index.js](index.js)
```js
module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v3.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};
```

### Step 2: Create serverless.yml
<image>

[serverless.yml](serverless.yml)
```yaml
service: group2-capstone-project
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: ap-southeast-1
  stage: ${env:DEPLOY_ENV}

functions:
  api:
    handler: index.handler
    events:
      - httpApi:
          path: /
          method: get

plugins:
  - serverless-offline
```

**Note**:
**DEPLOY_ENV** is a environment variable used to switch the deploy environment depending on whether the code change is committed to **dev**, **staging** or **main** branch.

- commit to **dev** branch     -> deploy the application to **dev** environment
- commit to **staging** branch -> deploy the application to **staging** environment
- commit to **main** branch    -> deploy the application to **prod** environment

How to set environment variable **DEPLOY_ENV** to the desired deploy environment when testing locally will be explained in the next step.

During automated deployment in CI/CD Pipeline, **DEPLOY_ENV** will be automatically set to the desired value depending on the branch where the commit was pushed to. This will be explained in more details when we look at GitHub Actions workflow.

### Step 3: Deploy and verify that the serverless application is working
Install dependencies with:
```
$ npm install
```

and then deploy to **prod** environment with:
```
$ export DEPLOY_ENV=prod
$ serverless deploy
```

Following is the output from deploy command:
```sh
Deploying group2-capstone-project to stage prod (ap-southeast-1)

✔ Service deployed to stack group2-capstone-project-prod (164s)

endpoint: GET - https://kjbbh5erp1.execute-api.ap-southeast-1.amazonaws.com/
functions:
  api: group2-capstone-project-prod-api (31 MB)
```

After succesful deployment the created serverless application can be invoked with curl command:
```
$ curl https://kjbbh5erp1.execute-api.ap-southeast-1.amazonaws.com/
```

which resulted in the following response:
```json
{
  "message": "Go Serverless v3.0! Your function executed successfully!",
  "input": {
    "version": "2.0",
    "routeKey": "GET /",
    "rawPath": "/",
    "rawQueryString": "",
    "headers": {
      "accept": "*/*",
      "content-length": "0",
      "host": "kjbbh5erp1.execute-api.ap-southeast-1.amazonaws.com",
      "user-agent": "curl/7.81.0",
      "x-amzn-trace-id": "Root=1-6482eeb9-7127d1b14ead14e049389cfd",
      "x-forwarded-for": "118.200.182.45",
      "x-forwarded-port": "443",
      "x-forwarded-proto": "https"
    },
    "requestContext": {
      "accountId": "255945442255",
      "apiId": "kjbbh5erp1",
      "domainName": "kjbbh5erp1.execute-api.ap-southeast-1.amazonaws.com",
      "domainPrefix": "kjbbh5erp1",
      "http": {
        "method": "GET",
        "path": "/",
        "protocol": "HTTP/1.1",
        "sourceIp": "118.200.182.45",
        "userAgent": "curl/7.81.0"
      },
      "requestId": "GPo9AhwoSQ0EM5A=",
      "routeKey": "GET /",
      "stage": "$default",
      "time": "09/Jun/2023:09:19:53 +0000",
      "timeEpoch": 1686302393355
    },
    "isBase64Encoded": false
  }
}
```

We have successfully deployed serverless application to AWS Lamda, tested and verified that the application produced the expected output. Next we will create an unit test script to test and verify the application output automatically instead of eye-balling.

# Unit tests
Tests help us to keep our code maintainable and working. Because even small changes can bring giant bugs, so if we keep our tests up to date with our code, the changes of facing a bug in the future are minor than without tests.

1. Install Jest with npm
   ```
   $ npm install --save-dev jest
   ```
   The *--save-dev* flag updates the **devDepenendices** in package.json. These are only used for local testing and development.

   package.json
   ```json
   "devDependencies": {
        "jest": "^29.5.0",
        "serverless-offline": "^12.0.4",
        "supertest": "^6.3.3"
    }
   ```

2. Test folder and test script
   When we run Jest, it's going to search for tests in our repo. It is recommened to have a folder that holds our test script.

   Create **index.test.js** inside \__tests\__ folder
   <image>

   [index.test.js](__tests__/index.test.js)

    ```js
    const { handler } = require('../index');

    describe('Test API Endpoints', () => {
    it('should return "Go Serverless v3.0! Your function executed successfully!"', async () => {
        // Mock event object
        const mockEvent = {};

        // Stub the JSON.stringify method to exclude circular references
        const originalStringify = JSON.stringify;
        JSON.stringify = jest.fn((obj, replacer, spaces) => {
        return originalStringify(obj, replacer, spaces);
        });

        // Invoke the handler function
        const result = await handler(mockEvent);

        // Restore the original JSON.stringify method
        JSON.stringify = originalStringify;

        // Assert the response
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual({
        message: 'Go Serverless v3.0! Your function executed successfully!',
        input: mockEvent,
        });
    }, 10000); // Increased timeout to 10000 milliseconds
    });
    ```

    This [index.test.js](__tests__/index.test.js) test script will invoke the application. Capture the output thrown out by the application and compare it with the expected output. The test is considerd pass when both the output equal or else the test is considered fail.

3. Run the unit test

    ```sh
    $ npm test

    > animated-train@1.0.0 test
    > jest --forceExit

    PASS  __tests__/index.test.js
    Test API Endpoints
        ✓ should return "Go Serverless v3.0! Your function executed successfully!" (1 ms)

    Test Suites: 1 passed, 1 total
    Tests:       1 passed, 1 total
    Snapshots:   0 total
    Time:        0.252 s
    Ran all test suites.
    ```
    The output from **npm test** command shows that the unit test has passed.

We have successfully ran the unit test locally. This unit test will be implemented in the CI/CD Pipeline and automatically triggered in GitHub Actions workflow.

# Package Vulnerability Scan
It is crucial to incorporate package vulnerability scanning in our CI/CD Pipeline for maintaining the security and integrity of our software. It help reduce the risk of deploying insecure packages to production. By catching vulnerabilities early on and addressing them promptly, we minimize the chances of a security incident occurring in your live production environment.

## Run vulnerability scan
There are many vulnerability scan tools, we will use **npm audit** here:

```sh
$ npm audit
found 0 vulnerabilities
```

There is no vulnerability found at this moment. But it is possible that vulnerability will be introduced in the future as more packages are used throughout the software development life cycle. Hence it is important to integrate vulnerability scanning in our CI/CD Pipeline which automates the process of identifying security issues. It saves time and effort compared to manual security reviews.

# GitHub Actions
We use GitHub Actions to automate our CI/CD Pipeline. Our CI/CD Pipeline build, test, and deploy code right from GitHub. We make code reviews and branch management fron within GitHub.

## About GitHub Actions Workflows
A workflow is a configurable automated process that will run one or more jobs. Workflows are defined by a YAML file checked in to our repository and will run when triggered by an event in our repository, or they can be triggered manually, or at a defined schedule.

We use event to trigger the workflow in our CI/CD Pipeline. Whenever a code change is push to the GitHub respository the workflow will be triggered and run unit test, package vulnerability scan and deploy the serverless application to the desired environment.

The following outline the steps required to create a GitHub Actions workflow.

### Step 1: Create **main.yml** in **.github/workflows** folder
<image>

[main.yml](.github/workflows/main.yml)
```yml
name: CICD with Serverless
run-name: ${{ github.actor }} is doing CICD with Serverless

on:
  push:
    branches:  [ main, "*"]

jobs:
  pre-deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "🎉 The job was automatically triggered by a ${{ github.event_name }} event."
      - run: echo "🐧 This job is now running on a ${{ runner.os }} server hosted by GitHub!"
      - run: echo "🔎 The name of your branch is ${{ github.ref }} and your repository is ${{ github.repository }}."

  install-dependencies:
    runs-on: ubuntu-latest
    needs: pre-deploy
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Run Installation of Dependencies Commands
        run: npm install
  
  scan-dependencies:
    runs-on: ubuntu-latest
    needs: install-dependencies
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Run Installation of Dependencies Commands
        run: npm install
      - name: Run npm audit to check for vulnerabilities
        run: npm audit
  
  unit-tests:
    runs-on: ubuntu-latest
    needs: scan-dependencies
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Run Installation of Dependencies Commands
        run: npm install
      - name: Run Unit Tests
        run: npm test

  deploy-prod:
    if:  github.ref == 'refs/heads/main'
    name: deploy to prod
    runs-on: ubuntu-latest
    needs: unit-tests
    strategy:
      matrix:
        node-version: [18.x]
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - name: serverless deploy
      uses: serverless/github-action@v3.2
      with:
        args: deploy
      env:
        DEPLOY_ENV: 'prod'
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

  deploy-stage:
    if: github.ref == 'refs/heads/staging'
    name: deploy to staging
    runs-on: ubuntu-latest
    needs: unit-tests
    strategy:
      matrix:
        node-version: [18.x]
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - name: serverless deploy
      uses: serverless/github-action@v3.2
      with:
        args: deploy
      env:
        DEPLOY_ENV: 'staging'
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

  deploy-dev:
    if: github.ref == 'refs/heads/dev'
    name: deploy to dev
    runs-on: ubuntu-latest
    needs: unit-tests
    strategy:
      matrix:
        node-version: [18.x]
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - name: serverless deploy
      uses: serverless/github-action@v3.2
      with:
        args: deploy
      env:
        DEPLOY_ENV: 'dev'
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```
### Workflow Syntax
**name**: The name of the workflow.

**on**: The type of event that can run the workflow. This workflow will only run when there is a git push to either the main or other branch.

**jobs**: A workflow consists of one or more jobs. Jobs run in parallel unless a ***needs*** keyword is used. Each job runs in a runner environment specified by ***runs-on***.

**steps**: A sequence of tasks to be carried out.

**uses**: Selects an action to run as part of a step in your job. An action is a reusable unit of code.

**with**: A map of input parameters.

**run**: Runs command line programs.

**env**: Set the environment variables.

### Step 2: Add AWS_ACCESS_KEY_ID and ASW_SECRET_ACCESS_KEY to GitHub Secrets
<image>

### Step 8: Create a pull request and commit a merge in GitHub to start the workflow
Commit changes locally and push it to GitHub. Navigate the repo on GitHub, click on the **Actions** tab to see the workflows.