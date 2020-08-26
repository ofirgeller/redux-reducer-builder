# Introduction 
A collection of Typescript/JavaScript packages used by Language Zen (Our language learning company)

# Development
1. To make sure that you have all the dependencies, run `yarn` in the root directory AND inside the specific package directory.
2. All packages should have a test command which can be invoked by calling `yarn test` from the package directory.
3. Always write tests to verify the correctness of the code and keep track of breaking changes to the API.

# Publishing
1. Make sure that all the changes relevant to this release are committed.
2. Run `yarn test` to confirm that the code doesn't break any tests.
3. run 'yarn publish'. you will be asked to enter a version number (even if the current commit is a version bump).
4. If you want to publish a pre-release version pass '--canary' 

