const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yynuzpbzqhofhwiyuquo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'; // service_role

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const ayurvedaAcademicianId = '73182981-b9b5-41ff-a398-d4b023796879';

    // 2. Check if Ayurveda FDPs already exist
    const { data: existing, error: existError } = await supabase
        .from('academician_opportunities')
        .select('id, title')
        .eq('type', 'FDP')
        .eq('created_by', ayurvedaAcademicianId);

    if (existError) {
        console.error("Error checking existing:", existError);
        return;
    }

    if (existing && existing.length > 0) {
        console.log("Ayurveda FDP records already exist:", existing);
        return;
    }

    // 3. Insert Ayurveda demo records
    const records = [
        {
            type: 'FDP',
            title: 'Evidence-Based Ayurveda: Clinical Research & Documentation',
            description: 'Faculty development program focused on clinical research methods, evidence documentation, case reporting, and structured clinical records in Ayurveda.',
            mode: 'Online',
            status: 'upcoming',
            created_by: ayurvedaAcademicianId
        },
        {
            type: 'FDP',
            title: 'Advances in Panchakarma Practice & Research',
            description: 'FDP focused on Panchakarma procedures, clinical documentation, research perspectives, and quality practices.',
            mode: 'Offline',
            status: 'ongoing',
            created_by: ayurvedaAcademicianId
        },
        {
            type: 'FDP',
            title: 'Medicinal Plants, Herbal Formulations & Quality Practices',
            description: 'Faculty development program covering medicinal plant documentation, Ayurvedic formulations, quality considerations, and research applications.',
            mode: 'Hybrid',
            status: 'upcoming',
            created_by: ayurvedaAcademicianId
        },
        {
            type: 'FDP',
            title: 'Ayurveda Wellness & Preventive Healthcare',
            description: 'FDP focused on Ayurveda-based wellness, preventive healthcare, lifestyle practices, diet, and patient education.',
            mode: 'Online',
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
        console.log("Successfully inserted Ayurveda FDP records:", inserted);
    }
}

main();
