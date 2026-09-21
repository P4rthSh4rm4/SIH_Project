const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yynuzpbzqhofhwiyuquo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase
        .from('academician_opportunities')
        .select('title, mode, type')
        .eq('type', 'FDP')
        .order('title');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('All FDP records:\n');
    data.forEach(r => {
        console.log('  Title: ' + r.title);
        console.log('  Mode:  ' + (r.mode || 'NULL'));
        console.log('');
    });
}

main();
