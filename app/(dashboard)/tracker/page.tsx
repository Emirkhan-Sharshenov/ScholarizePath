import TrackerBoard from '@/components/tracker/TrackerBoard';

export default function TrackerPage() {
    return (
        <main className="w-full px-4 sm:px-6 md:px-10 pb-12">
            <div className="pt-4 md:pt-6 max-w-7xl mx-auto">
                <TrackerBoard />
            </div>
        </main>
    );
}
