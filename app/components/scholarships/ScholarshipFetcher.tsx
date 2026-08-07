'use client';

import { useEffect, useState } from "react";
import ScholarshipsListUI from "./Scholarships";
import ScholarshipRow from "./ScholarshipRow";


function ScholarshipFetcher() {
    const [scholarships, setScholarships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchScholarships() {
            try {
                const res = await fetch('/api/scholarships')
                const data = await res.json()

                setScholarships(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchScholarships()
    }, 
    [])
        if (loading) {
            return <div>Loading...</div>
        }

    return (
        <div className="text-3xl text-red-500">
            ScholarshipFetcher works!
        </div>
    );
}

export default ScholarshipFetcher