<?php
// This bootstrap file creates/resets the test database before running tests
// It ensures RefreshDatabase trait has a properly initialized database

$dbPath = ':memory:';
$sqlite = new SQLite3($dbPath);
$sqlite->exec("PRAGMA foreign_keys = ON;");

// Create migrations table
$sqlite->exec("CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY,
    migration TEXT NOT NULL,
    batch INTEGER NOT NULL
);");

$sqlite->close();
echo "✅ Test database initialized at $dbPath\n";
