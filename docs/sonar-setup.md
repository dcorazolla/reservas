# SonarQube setup and recommended PHP rules

This document describes a lightweight setup for SonarQube and recommended rules/quality gate settings for PHP projects in this repository.

1) Install SonarQube (local quickstart)
- Quick (dev) using Docker:

```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:community
```

2) Scanner
- The project includes `sonar-project.properties` at repository root.
- Use the provided `scripts/run_tests_and_sonar.sh` to generate PHPUnit coverage (Clover XML) and run sonar-scanner (Docker image `sonarsource/sonar-scanner-cli`).

3) Recommended Quality Profile / Rules for PHP
- Install and enable the SonarPHP analyzer (comes preinstalled in SonarQube recent versions).
- Use the default **Sonar way** profile as a starting point. Suggested additional checks:
  - Complexity: set maximum allowed cognitive/complexity per function (e.g., 10).
  - Duplications: enforce low duplication on new code (e.g., <3%).
  - Coverage: require minimum coverage on new code (e.g., >= 80%).
  - Security: enable security rules (taint analysis, SQL injection, XSS) and treat issues as blockers on new code.
  - Maintainability: enable issues for long methods and large classes.

4) Quality Gate suggestion
- Create a Quality Gate that fails the build when any of these are violated on *new code*:
  - New code coverage < 80%
  - New code security hotspots > 0
  - New code maintainability rating worse than A

5) CI Integration
- In CI, run `scripts/run_tests_and_sonar.sh` and set `SONAR_HOST_URL` and `SONAR_LOGIN` env vars.
- Make the CI job fail if SonarQube Quality Gate fails: use the SonarQube Web API to check the task status, or use SonarCloud's integration if using the cloud offering.

6) Notes
- Rules and profiles are managed on the SonarQube server — this repo provides the scanner configuration and coverage reports. Adjust server-side profiles to match organizational policies.
