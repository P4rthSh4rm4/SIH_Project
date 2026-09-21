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
        .eq('type', 'consultancy')
        .eq('created_by', ayurvedaAcademicianId);

    if (existError) {
        console.error("Error checking existing:", existError);
        return;
    }

    if (existing && existing.length > 0) {
        console.log("Ayurveda consultancy records already exist:", existing);
        return;
    }

    // 3. Insert Ayurveda demo records
    const records = [
        {
            type: 'consultancy',
            title: 'Ayurvedic Clinical Documentation & Quality Improvement',
            description: 'Consultancy focused on improving clinical documentation, treatment records, standard operating procedures, and quality practices in Ayurveda healthcare settings.',
            status: 'upcoming',
            created_by: ayurvedaAcademicianId
        },
        {
            type: 'consultancy',
            title: 'Ayurveda Wellness Program Design',
            description: 'Consultancy for designing structured Ayurveda wellness programs, preventive-care initiatives, lifestyle guidance, and patient education.',
            status: 'ongoing',
            created_by: ayurvedaAcademicianId
        },
        {
            type: 'consultancy',
            title: 'Medicinal Plants & Herbal Product Consultancy',
            description: 'Consultancy involving medicinal plant identification, documentation, herbal product development support, and quality-related practices.',
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
        console.log("Successfully inserted Ayurveda consultancy records:", inserted);
    }
}

main();
