# (SCTP) Cloud Infrastructure Engineering Capstone Project Documentation
## `Case 1 - CI/CD Pipeline`
### `Group 2 - Taufiq, Bing Xian & Liau`
<br>
<br>

# Company Profile
AutomateTech Solutions is a cutting-edge startup specializing in DevOps automation and cloud-native solutions. Our team of highly skilled software engineers and DevOps experts is dedicated to streamlineing the release cycle process and enabling rapid and efficient deployment of our software applications.

# DevOps Mission Statement
Our mission is to accelerate software deployment using CI/CD Pipeline so that each release cycle can be released quickly from the development environment, to staging environment and to production environment.

# CI/CD Pipeline Overview <a name="pipeline-overview"></a>
![Pipeline](https://github.com/bxianlim/group2-capstone-project/assets/22501900/5ab9ef76-d49f-49f5-ab9d-10d808d8384a)

# Branching Strategy <a name="branching-strategy"></a>
As the company is going at a fast pace growth rhythm, there will be more engineers onboarding in the next few quaters. As such we need to ensure that as the team size grows, the release pipeline is well controlled. Keeping with these demands in mind, we are building a DevOps cycle with the this branching strategy:

1. All `features` branches must be merged into `dev` branch.
2. `staging` branch must be merged from `dev` branch.
3. `main` branch must be merged from `dev` branch.

The following diagram illustrate this branching strategy:

![branching strategy](https://github.com/bxianlim/group2-capstone-project/assets/22501900/31730434-0fa3-4009-bab6-8cf7e70ebcbe)

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

# Branch Protection
In order to implement the above mentioned branching strategy we create branch protection rule in the GitHub repository as follows:

![branch protect 1](https://github.com/bxianlim/group2-capstone-project/assets/22501900/bd3fce30-a38d-467c-ab1b-2a4953710eb0)
![branch protect 2](https://github.com/bxianlim/group2-capstone-project/assets/22501900/faa129c7-b666-4dec-a498-5679b1f89c4d)

With the branch protection rule applied direct commit push to `dev`, `stage` & `main` branch will be rejected as shown below:
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

The branch protection rule ensure that all commits to `dev`, `staging` & `main` branch must be made to a non-protected branch (i.e. `feature` branch) and submitted via a pull request. In addition each pull request require approvals. Merging will be blocked until the pull request is reviewed and approved by someone else other than the person who created the pull request.

![review required](https://github.com/bxianlim/group2-capstone-project/assets/22501900/e1d287c3-32b5-46be-9015-4086471a2598)

# Serverless Application
This CI/CD Pipeline automate the deployment of a serverless application with AWS **Lambda** serverless compute service. AWS **Lambda** allow us to run code without provisoning or managing infrastruture. This kind of AWS service is well suited for a startup company like us to save costs by paying only for the compute time we use -- *by per-millisecond* -- instead of provisioning infrastructure upfron for peak capacity.

## These are the steps to create the serverless application

### Step 1: Create index.js file -- `this is the main application code`
![index_js](https://github.com/bxianlim/group2-capstone-project/assets/22501900/fa028f97-a481-4833-a275-ceb4a132b59d)

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
![serverless_yml](https://github.com/bxianlim/group2-capstone-project/assets/22501900/3a2da739-794f-47ab-91f2-0bbb71cb76a3)

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
`DEPLOY_ENV` is a environment variable used to switch the deploy environment depending on whether the code change is committed to `dev`, `staging` or `main` branch.

- commit to `dev` branch     -> deploy the application to `dev` environment
- commit to `staging` branch -> deploy the application to `staging` environment
- commit to `main` branch    -> deploy the application to `prod` environment

How to set environment variable `DEPLOY_ENV` to the desired deploy environment when testing locally will be explained in the next step.

During automated deployment in CI/CD Pipeline, `DEPLOY_ENV` will be automatically set to the desired value depending on the branch where the commit was pushed to. This will be explained in more details when we look at [GitHub Actions](#github-actions) workflow.

### Step 3: Deploy and verify that the serverless application is working - **`local testing`**
Install dependencies with:
```
$ npm install
```

and then deploy to `prod` environment with:
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
   The *--save-dev* flag updates the `devDepenendices` in package.json. These are only used for local testing and development.

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
   
   ![__test__](https://github.com/bxianlim/group2-capstone-project/assets/22501900/4dc508db-3bb6-47dd-ab5f-7a93d7601b86)

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

3. Run the unit test - **`local testing`**

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

We have successfully ran the unit test locally. This unit test will be implemented in the CI/CD Pipeline and automatically triggered in [GitHub Actions](#github-actions) workflow.

# Package Vulnerability Scan
It is crucial to incorporate package vulnerability scanning in our CI/CD Pipeline for maintaining the security and integrity of our software. It help reduce the risk of deploying insecure packages to production. By catching vulnerabilities early on and addressing them promptly, we minimize the chances of a security incident occurring in your live production environment.

## Run vulnerability scan - `local testing`
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

We use event to trigger the workflow in our CI/CD Pipeline.

Earlier we run unit test, vulnerability scan and deploy serverless application in local environment. It is now time to set up a CI/CP Pipeline that run all these jobs automatically whenever a code change is push to the GitHub respository.

The following outline the steps required to create a GitHub Actions workflow.

### Step 1: Create **main.yml** in **.github/workflows** folder
![main_yml](https://github.com/bxianlim/group2-capstone-project/assets/22501900/57973d19-e7aa-4bd1-b17d-1879c0fb8a7c)

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

### These are the jobs defined in [main.yml](.github/workflows/main.yml) which will be run in GitHub Actions workflow:

Job name: `pre-deploy`
```yml
pre-deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "🎉 The job was automatically triggered by a ${{ github.event_name }} event."
      - run: echo "🐧 This job is now running on a ${{ runner.os }} server hosted by GitHub!"
      - run: echo "🔎 The name of your branch is ${{ github.ref }} and your repository is ${{ github.repository }}."
```

In `pre-deploy` job, useful information such as the triggered event name, branch and repository name is output using the **echo** command. The **echo** output can be seen in the job details when it complete.

![pre-deploy detail](https://github.com/bxianlim/group2-capstone-project/assets/22501900/b29a207e-4a06-45ca-ab6b-d5e1e04acf01)
<br>
<br>
Job name: `install-dependencies`
```yml
install-dependencies:
    runs-on: ubuntu-latest
    needs: pre-deploy
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Run Installation of Dependencies Commands
        run: npm install
```

In `install-dependencies` job, all the required dependencies are installed with **npm install** command. `pre-deploy` job must complete successfully before this job will run because of `needs: pre-deploy`.

![install-dependencies workflow](https://github.com/bxianlim/group2-capstone-project/assets/22501900/e646ba29-d3ce-423b-a400-c8294217a05c)
<br>
<br>
Job name: `scan-dependencies`
```yml
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
```

In `scan-dependencies` job, **npm audit** command is used to run the package vulnerability scan. `install-dependencies` job must complete successfully before this job will run because of `needs: install-dependencies`.

![scan-dependencies workflow](https://github.com/bxianlim/group2-capstone-project/assets/22501900/48b55384-07c2-4cbd-994b-901c9f57ee53)
<br>
<br>
Job name: `unit-tests`
```yml
runs-on: ubuntu-latest
    needs: install-dependencies
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Run Installation of Dependencies Commands
        run: npm install
      - name: Run Unit Tests
        run: npm test
```

In `unit-tests` job, **npm test** command is used to run unit test. `install-dependencies` job must complete successfully before this job will run because of `needs: install-dependencies`.

As both `scan-dependencies` and `unit-tests` jobs `needs: install-dependencies`, these 2 jobs will run in parallel after `install-dependencies` job is completed.

![unit-test workflow](https://github.com/bxianlim/group2-capstone-project/assets/22501900/4d7ffd2a-8f90-4c9a-8689-c3fdaff3ff1d)
<br>
<br>
Job name: `deploy-prod`
```yml
deploy-prod:
    if:  github.ref == 'refs/heads/main'
    name: deploy to prod
    runs-on: ubuntu-latest
    needs: [scan-dependencies, unit-tests]
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
```

In `deploy-prod` job, we check whether the commit is push to main branch with the `if` condition:
```
if:  github.ref == 'refs/heads/main'
```
This job will not run if the commit is push to other branches (e.g. `dev` or `staging`)

Both `scan-dependencies` and `unit-tests` jobs must complete successfully before this job will run because of `needs: [scan-dependencies, unit-tests]`.

The serverless application is deployed in the this step:
```
- name: serverless deploy
      uses: serverless/github-action@v3.2
      with:
        args: deploy
      env:
        DEPLOY_ENV: 'prod'
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}      
``` 

Notice that there are 3 environment variables defined in the `serverless deploy` step:

`DEPLOY_ENV` - the value of this variable is set to **prod** and will be referenced in [serverless.yml](serverless.yml) as shown below:

[serverless.yml](serverless.yml)
```yml
provider:
  name: aws
  runtime: nodejs18.x
  region: ap-southeast-1
  stage: ${env:DEPLOY_ENV}
 ``` 

This use of environment variable `DEPLOY_ENV` ensure that the serverless application is deployed to the `prod` environment in this case where the commit is push to `main` branch.

`AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` - these 2 environment variables hold the AWS credentials stored as GitHub Secrets described in the next step. The AWS credentials is required to access AWS Lamda service from within the CI/CD Pipeline.
<br>
<br>
Job name: `deploy-staging` & `deploy-dev`

These 2 jobs are almost identical to `deploy-prod` except the followings:

1. The `if` condition is used to check for commit push to `staging` and `dev` branch respectively.
   ```yml
   deploy-staging:
       if: github.ref == 'refs/heads/staging'
   ```
   ```yml
   deploy-dev:
       if: github.ref == 'refs/heads/dev'
   ```

2. The `DEPLOY_ENV` variable is set to **staging** and **dev** when the commit is push to `staging` and `dev` branch respectively.

   `deploy-staging`
   ```yml
   env:
        DEPLOY_ENV: 'staging'
   ```
   `deploy-dev`
   ```yml
   env:
        DEPLOY_ENV: 'dev'
   ```

### Step 2: Add AWS_ACCESS_KEY_ID and ASW_SECRET_ACCESS_KEY to GitHub Secrets
- Go to Settings > Secret and variables > Actions and click `New repository secret`

![github secret-1](https://github.com/bxianlim/group2-capstone-project/assets/22501900/23b6dd29-b4c9-4170-9f08-c3d6b67113d4)

- Add **AWS_ACCESS_KEY_ID** & **ASW_SECRET_ACCESS_KEY**

![github secret-2](https://github.com/bxianlim/group2-capstone-project/assets/22501900/c1aed240-49fa-4bb4-890a-cc392a8b005b)

- Both secrets added as show below

![github secret-3](https://github.com/bxianlim/group2-capstone-project/assets/22501900/ead9b249-b3fa-462a-b40d-8290b2c38da3)

### Step 3: Create a pull request and commit a merge in GitHub to start the workflow
- Create a `New pull request`

![image](https://github.com/bxianlim/group2-capstone-project/assets/22501900/520d5317-4be8-473c-bc1a-5174b9588593)

- Choose the desired base and merge branch, and click `Create pull request`

![compare changes](https://github.com/bxianlim/group2-capstone-project/assets/22501900/53846345-0d97-412d-afde-1b0879719cb5)

- A new pull request is now open. Leave a comment and click `Create pull request`

![open PR](https://github.com/bxianlim/group2-capstone-project/assets/22501900/0de90b64-444c-4119-b38b-6173183080aa)

- Review the pull request

![add review](https://github.com/bxianlim/group2-capstone-project/assets/22501900/e69386e5-ee31-4435-a23c-792f817ab4b7)

- Approve and submit the pull request

![submit review](https://github.com/bxianlim/group2-capstone-project/assets/22501900/9667214a-f0d3-4ea9-8b37-802d1d45dde9)

- Navigate the repo on GitHub, click on the `Actions` tab to see the workflows.

![workflow](https://github.com/bxianlim/group2-capstone-project/assets/22501900/13a668bd-5d3f-4d23-8a7c-6db03c3dbb10)

This pull request is merging `feature2` into `dev` branch which resulted in `deploy-dev` job being ran whereas `deploy-prod` and `deploy-staging` were skipped.

# Conclusion
In this document we cover all aspect of our CI/CD Pipeline, including:
1. Branching strategy
2. GitHub branch creation & protection
3. Serverless application deployment
4. Unit test
5. Package vulnerability scan
6. GitHub Actions Workflow
