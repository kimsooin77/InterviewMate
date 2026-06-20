const { Client } = require('pg');
const { readFileSync } = require('fs');
const { join } = require('path');

const timestampColumns = [
  ['users', 'created_at'],
  ['users', 'updated_at'],
  ['users', 'deleted_at'],
  ['resumes', 'created_at'],
  ['resumes', 'updated_at'],
  ['resumes', 'deleted_at'],
  ['resumes', 'analysis_completed_at'],
  ['interview_sessions', 'started_at'],
  ['interview_sessions', 'completed_at'],
  ['interview_sessions', 'created_at'],
  ['interview_sessions', 'deleted_at'],
  ['interview_answers', 'submitted_at'],
  ['interview_answers', 'created_at'],
  ['refresh_tokens', 'expires_at'],
  ['refresh_tokens', 'created_at'],
  ['question_sets', 'created_at'],
  ['question_sets', 'deleted_at'],
  ['questions', 'created_at'],
  ['evaluations', 'created_at'],
  ['evaluation_items', 'created_at'],
  ['reports', 'created_at'],
  ['reports', 'deleted_at'],
];

function loadEnv() {
  const envPath = join(__dirname, '..', '.env.development');
  const entries = readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separatorIndex = line.indexOf('=');
      return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
    });

  for (const [key, value] of entries) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function getColumnType(client, tableName, columnName) {
  const result = await client.query(
    `
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
    `,
    [tableName, columnName],
  );

  return result.rows[0]?.data_type;
}

async function main() {
  loadEnv();

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'interview_mate',
  });

  await client.connect();

  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL TIME ZONE 'UTC'");

    if (await getColumnType(client, 'refresh_tokens', 'expires_at')) {
      await client.query(`
        UPDATE refresh_tokens
        SET expires_at = COALESCE(created_at, NOW()) + INTERVAL '7 days'
        WHERE expires_at IS NULL
      `);
    }

    for (const [tableName, columnName] of timestampColumns) {
      const dataType = await getColumnType(client, tableName, columnName);

      if (!dataType) {
        console.log(`skip missing column: ${tableName}.${columnName}`);
        continue;
      }

      if (dataType === 'timestamp with time zone') {
        console.log(`already timestamptz: ${tableName}.${columnName}`);
        continue;
      }

      if (dataType !== 'timestamp without time zone') {
        console.log(`skip non-timestamp column: ${tableName}.${columnName} (${dataType})`);
        continue;
      }

      const table = quoteIdentifier(tableName);
      const column = quoteIdentifier(columnName);

      await client.query(
        `ALTER TABLE ${table} ALTER COLUMN ${column} TYPE timestamptz USING ${column} AT TIME ZONE 'UTC'`,
      );
      console.log(`converted to timestamptz: ${tableName}.${columnName}`);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
