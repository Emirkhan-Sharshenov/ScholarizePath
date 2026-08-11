'use client';

import React from 'react';
import { Scholarship } from '@/types/scholarship';
import { ScholarshipBreadcrumbsHeader } from './ScholarshipBreadcrumbsHeader';
import { ScholarshipHeroBanner } from './ScholarshipHeroBanner';
import { EligibilityChecker } from './EligibilityChecker';
import { EligibilityCriteriaList } from './EligibilityCriteriaList';
import { ApplySidebarCard } from './ApplySidebarCard';
import { AboutScholarship } from './AboutScholarship';

export default function ScholarshipDetailsPage({ scholarship }: { scholarship: Scholarship }) {
    const officialSite = scholarship?.officialWebsite || scholarship?.applicationLink || '#';

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 font-sans md:p-8 text-slate-800">
            <div className="mx-auto max-w-7xl">

               
                <ScholarshipBreadcrumbsHeader title={scholarship.scholarshipName} />

                
                <ScholarshipHeroBanner scholarship={scholarship} />

              
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                   
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EligibilityChecker />
                            <EligibilityCriteriaList scholarship={scholarship} />
                        </div>
                    </div>

        
                    <div className="lg:col-span-1">
                        <ApplySidebarCard applyUrl={officialSite} />
                    </div>

                </div>

                <AboutScholarship description={scholarship.description} />

            </div>
        </div>
    );
}