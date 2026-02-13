<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    use RefreshDatabase;
    /**
     * Safety guard to prevent running the test suite against a non-testing database.
     *
     * This will abort the test run unless either:
     * - `APP_ENV` is `testing` and the DB is configured for testing (sqlite :memory:), or
     * - the env var `ALLOW_TESTS_ON_NON_TEST_DB` is set to a truthy value (opt-in override).
     *
     * The guard helps avoid accidental `migrate:fresh` or refreshes against a local development DB.
     */
    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();

        $allow = getenv('ALLOW_TESTS_ON_NON_TEST_DB') ?: ($_ENV['ALLOW_TESTS_ON_NON_TEST_DB'] ?? null);
        if ($allow) {
            return;
        }

        $appEnv = getenv('APP_ENV') ?: ($_ENV['APP_ENV'] ?? null);
        $dbConn = getenv('DB_CONNECTION') ?: ($_ENV['DB_CONNECTION'] ?? null);
        $dbDatabase = getenv('DB_DATABASE') ?: ($_ENV['DB_DATABASE'] ?? null);

        if ($appEnv !== 'testing') {
            fwrite(STDERR, "Refusing to run tests: APP_ENV={$appEnv}. Set APP_ENV=testing or set ALLOW_TESTS_ON_NON_TEST_DB=1 to override.\n");
            exit(1);
        }

        // If tests are not using sqlite in-memory, warn/abort to avoid wiping a real DB.
        if (!($dbConn === 'sqlite' && ($dbDatabase === ':memory:' || $dbDatabase === '')) ) {
            fwrite(STDERR, "Refusing to run tests: DB_CONNECTION={$dbConn}, DB_DATABASE={$dbDatabase}.\nEnsure tests run against sqlite :memory: or set ALLOW_TESTS_ON_NON_TEST_DB=1 to override.\n");
            exit(1);
        }
    }

}
