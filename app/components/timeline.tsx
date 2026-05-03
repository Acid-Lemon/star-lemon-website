'use client';

import { useState, useEffect } from 'react';

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
      // 按日期正序排列
      data.sort((a: TimelineItem, b: TimelineItem) => a.date.localeCompare(b.date));
      setTimelineData(data.filter((item: TimelineItem & { is_active: boolean }) => item.is_active));
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      // 使用默认数据
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

  // 格式化日期显示
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
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'milestone':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'update':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
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
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="flex-1 p-6 rounded-2xl bg-gray-100">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
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
      {/* 时间轴线条 */}
      <div className="absolute left-8 top-10 bottom-2 w-0.5 bg-gradient-to-b from-orange-200 via-orange-300 to-orange-200" />
      
      <div className="space-y-6">
        {timelineData.map((item, index) => (
          <div
            key={item.id}
            className="relative flex gap-6 cursor-pointer group"
            onClick={() => setActiveIndex(index === activeIndex ? -1 : index)}
          >
            {/* 时间轴节点 */}
            <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${getTypeColor(item.type)} shadow-lg transition-all duration-300 shrink-0 mt-2 ${
              index === activeIndex ? 'ring-4 ring-orange-200 scale-110' : 'group-hover:scale-105'
            }`}>
              <div className="text-white">
                {getTypeIcon(item.type)}
              </div>
            </div>

            {/* 内容卡片 */}
            <div className={`flex-1 p-6 rounded-2xl transition-all duration-300 ${
              index === activeIndex
                ? 'bg-white shadow-xl border border-orange-100'
                : 'bg-white/50 hover:bg-white hover:shadow-md'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-gray-500">{formatDate(item.date)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.type === 'post' ? 'bg-blue-100 text-blue-700' :
                  item.type === 'milestone' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {getTypeLabel(item.type)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
