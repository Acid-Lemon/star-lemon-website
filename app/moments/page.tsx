import MomentsClient from './moments-client';

export default async function MomentsPage() {
    return (
        <div className="flex-1 flex flex-col py-8 px-4">
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">动态</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">记录生活里的点滴星光</p>
            </div>
            <MomentsClient />
        </div>
    );
}
