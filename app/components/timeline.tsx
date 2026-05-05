'use client';

import { useState, useEffect } from 'react';
import { RiArticleLine, RiStarLine, RiRefreshLine } from '@remixicon/react';

interface TimelineItem {
  id: number;
  date: string;
  title: string;
  description: string;
  type: string;
}

export function Timeline() {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      const res = await fetch('/api/timeline');
      const data = await res.json();
      data.sort((a: TimelineItem, b: TimelineItem) => a.date.localeCompare(b.date));
      setTimelineData(data.filter((item: TimelineItem & { is_active: boolean }) => item.is_active));
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      setTimelineData([
        {
          id: 1,
          date: '2024-12',
          title: '网站全新改版',
          description: '采用卡片式布局，优化用户体验，新增时间轴功能。',
          type: 'milestone'
        },
        {
          id: 2,
          date: '2024-08',
          title: '网站正式上线',
          description: 'Star & Lemon 的小站正式上线，开始记录我们的故事。',
          type: 'milestone'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post':
        return 'bg-blue-500';
      case 'milestone':
        return 'bg-orange-500';
      case 'update':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <RiArticleLine className="w-4 h-4" />;
      case 'milestone':
        return <RiStarLine className="w-4 h-4" />;
      case 'update':
        return <RiRefreshLine className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return '文章';
      case 'milestone': return '里程碑';
      case 'update': return '更新';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-6 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 p-6 rounded-2xl bg-gray-100 dark:bg-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (timelineData.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="absolute left-8 top-10 bottom-2 w-0.5 bg-gradient-to-b from-orange-200 via-orange-300 to-orange-200 dark:from-orange-800 dark:via-orange-700 dark:to-orange-800" />

      <div className="space-y-6">
        {timelineData.map((item, index) => (
          <div
            key={item.id}
            className="relative flex gap-6 cursor-pointer group"
            onClick={() => setActiveIndex(index === activeIndex ? -1 : index)}
          >
            <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${getTypeColor(item.type)} shadow-lg transition-all duration-300 shrink-0 mt-2 ${
              index === activeIndex ? 'ring-4 ring-orange-200 dark:ring-orange-800 scale-110' : 'group-hover:scale-105'
            }`}>
              <div className="text-white">
                {getTypeIcon(item.type)}
              </div>
            </div>

            <div className={`flex-1 p-6 rounded-2xl transition-all duration-300 ${
              index === activeIndex
                ? 'bg-white dark:bg-gray-900 shadow-xl border border-orange-100 dark:border-orange-900/30'
                : 'bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 hover:shadow-md'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{formatDate(item.date)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.type === 'post' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                  item.type === 'milestone' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                  'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                }`}>
                  {getTypeLabel(item.type)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
