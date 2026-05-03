import QuotesClient from './quotes-client';

export default async function QuotesPage() {
    return (
        <div className="flex-1 flex flex-col py-8 px-4">
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">一言</h1>
                <p className="text-gray-500 text-sm">那些触动心弦的句子</p>
            </div>
            <QuotesClient />
        </div>
    );
}
