# group2-capstone-project

git --help **resource for commands

Github repo created
Branches created : "Dev", "staging"
Staging and main locked cannot be pushed to, all push to dev

# Company Profile
AutomateTech Solutions is a cutting-edge startup specializing in DevOps automation and cloud-native solutions. Our team of highly skilled software engineers and DevOps experts is dedicated to streamlineing the release cycle process and enabling rapid and efficient deployment of our software applications.

# Mission Statement
Our mission is to accelerate software deployment ...

## Unit tests
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

2. Test Folder
   When we run Jest, it's going to search for tests in our repo. It is recommened to have a folder that holds our test script.    