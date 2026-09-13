import CostCalculator from '@/components/calculator/CostCalculator';

export default function CalculatorPage() {
    return (
        <main className="w-full px-4 sm:px-6 md:px-10 pb-12">
            <div className="pt-4 md:pt-6 max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-lg md:text-[20px] font-bold text-slate-900">Cost Calculator</h1>
                    <h2 className="text-xs md:text-sm text-gray-500 mt-0.5">
                        Estimate tuition and living costs for any university, and see how a scholarship offsets them
                    </h2>
                </div>

                <CostCalculator />
            </div>
        </main>
    );
}
