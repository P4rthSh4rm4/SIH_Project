const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yynuzpbzqhofhwiyuquo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'; // service_role

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const ayurvedaAcademicianId = '73182981-b9b5-41ff-a398-d4b023796879';

    // 2. Check if Ayurveda projects already exist
    const { data: existing, error: existError } = await supabase
        .from('academician_opportunities')
        .select('id, title')
        .eq('type', 'research')
        .eq('created_by', ayurvedaAcademicianId);

    if (existError) {
        console.error("Error checking existing:", existError);
        return;
    }

    if (existing && existing.length > 0) {
        console.log("Ayurveda research records already exist:", existing);
        return;
    }

    // 3. Insert Ayurveda demo records
    const records = [
        {
            type: 'research',
            title: 'Clinical Evidence in Ayurveda',
            description: 'Research project focused on documenting clinical outcomes, treatment approaches, and evidence-based practices in Ayurveda.',
            status: 'ongoing',
            created_by: ayurvedaAcademicianId
        },
        {
            type: 'research',
            title: 'Medicinal Plants and Herbal Formulations',
            description: 'Research on medicinal plants, traditional formulations, therapeutic applications, documentation, and quality-related aspects of Ayurvedic medicines.',
            status: 'upcoming',
            created_by: ayurvedaAcademicianId
        },
        {
            type: 'research',
            title: 'Panchakarma Clinical Research',
            description: 'Research project focused on documenting Panchakarma procedures, clinical outcomes, patient observations, and evidence generation.',
            status: 'upcoming',
            created_by: ayurvedaAcademicianId
        }
    ];

    const { data: inserted, error: insertError } = await supabase
        .from('academician_opportunities')
        .insert(records)
        .select();

    if (insertError) {
        console.error("Failed to insert records:", insertError);
    } else {
        console.log("Successfully inserted Ayurveda research records:", inserted);
    }
}

main();
