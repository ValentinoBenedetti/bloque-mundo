const { Client } = require('pg');

async function inspectTriggers() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'bloquemundo_db',
        password: 'admin',
        port: 5433,
    });

    try {
        await client.connect();
        
        // Consultar disparadores (triggers)
        const triggersRes = await client.query(`
            SELECT 
                trigger_schema,
                trigger_name,
                event_manipulation,
                event_object_table,
                action_statement,
                action_timing
            FROM information_schema.triggers;
        `);
        console.log("=== TRIGGERS ===");
        console.log(JSON.stringify(triggersRes.rows, null, 2));

        // Consultar funciones (functions) creadas por el usuario
        const funcsRes = await client.query(`
            SELECT 
                n.nspname as schema,
                p.proname as function_name,
                pg_get_functiondef(p.oid) as definition
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public';
        `);
        console.log("=== FUNCTIONS ===");
        for (const f of funcsRes.rows) {
            console.log(`\n--- Function: ${f.function_name} ---`);
            console.log(f.definition);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspectTriggers();
