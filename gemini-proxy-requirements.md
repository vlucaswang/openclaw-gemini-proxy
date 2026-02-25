Implement feature below by following TDD:
1. Write failing tests for the feature.
2. Implement the code to make the tests pass.
3. Run the test suite.
4. If any tests fail, analyze the errors and debug the code.
5. Refactor for clarity and efficiency.
6. Repeat until all tests are green.
7. When complete, output the phrase '<promise>TESTS_PASSED</promise>'.

Feature:
Create a proxy running locally as a service allowing openclaw to receive the messages from discord, translate it to input for gemini cli and launch the cli. Get the response fom gemini cli and forward back to openclaw.

- launching cli has to be full automated, no manual input.
- The proxy need to drive the complete cli environment(tool use, file edit and git etc). Prefer to simulate a TTY terminal to run cli.
- Able to run browser, consider to use openclaw playwright as a skill.
- cronjob
- sub agent proxy
- loading the md files from openclaw.
