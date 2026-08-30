import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center relative font-sans p-4 sm:p-6 md:p-8 select-none">
       


            <main className="flex flex-col items-center justify-center text-center w-full max-w-sm sm:max-w-md md:max-w-2xl my-auto text-[#0058BD]">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue- tracking-tight mb-3 sm:mb-4">
                    Page Not Found
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-[#64748b] leading-relaxed max-w-xs sm:max-w-md md:max-w-xl">
                    Sorry, the page you're looking for doesn't exist or has been moved.
                </p>
            </main>
        </div>
    );
}