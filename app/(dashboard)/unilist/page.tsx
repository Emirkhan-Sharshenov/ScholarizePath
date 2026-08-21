import { Header } from '@/components/unilist/Header';
import { DocxGenerator } from '@/components/unilist/DocxGenerator';

export default function Home() {
    return (
        <div className="min-h-screen bg-[rgb(246,247,251)]  flex flex-col">
            <main className="flex-1 px-8 py-10">
                <DocxGenerator />
            </main>
        </div>
    );
}