const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yynuzpbzqhofhwiyuquo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'; // service_role

const supabase = createClient(supabaseUrl, supabaseKey);

// One-time fix: set mode on the 4 Ayurveda FDP records that were seeded without it
const updates = [
    { title: 'Evidence-Based Ayurveda: Clinical Research & Documentation', mode: 'Online' },
    { title: 'Advances in Panchakarma Practice & Research', mode: 'Offline' },
    { title: 'Medicinal Plants, Herbal Formulations & Quality Practices', mode: 'Hybrid' },
    { title: 'Ayurveda Wellness & Preventive Healthcare', mode: 'Online' },
];

async function main() {
    console.log('Fixing Ayurveda FDP mode values...\n');

    for (const { title, mode } of updates) {
        const { data, error } = await supabase
            .from('academician_opportunities')
            .update({ mode })
            .eq('type', 'FDP')
            .eq('title', title)
            .is('mode', null)  // Only update if mode is currently NULL
            .select('id, title, mode');

        if (error) {
            console.error(`FAILED: "${title}" → ${error.message}`);
        } else if (data && data.length > 0) {
            console.log(`UPDATED: "${title}" → mode = "${mode}" (${data.length} record(s))`);
        } else {
            console.log(`SKIPPED: "${title}" — no matching record with NULL mode found`);
        }
    }

    console.log('\nDone.');
}

main();
