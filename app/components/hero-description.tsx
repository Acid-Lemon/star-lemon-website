'use client';

import {OnlineBadge, usePresence} from './presence';
import {TypewriterText} from './typewriter';

export function HeroDescription({siteDescription}: { siteDescription: string }) {
    const {online} = usePresence('/');
    const texts = [
        siteDescription,
        '记录技术，分享生活',
        '代码与文字的交汇点',
        '两个开发者的数字花园',
    ];

    return (
        <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg min-h-[3.5rem]">
                <TypewriterText texts={texts} speed={70} deleteSpeed={35} pauseDuration={2500}/>
            </p>
            <div className="mt-3">
                <OnlineBadge online={online}/>
            </div>
        </div>
    );
}
