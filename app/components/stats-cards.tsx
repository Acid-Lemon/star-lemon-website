import db from '../../lib/db';
import { RiArticleLine, RiUserAddLine, RiChat3Line } from '@remixicon/react';

export async function StatsCards() {
  let stats = {
    posts: 0,
    users: 0,
    comments: 0
  };

  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM posts) as posts,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM messages) as comments
    `);
    stats = {
      posts: parseInt(result.rows[0]?.posts || '0'),
      users: parseInt(result.rows[0]?.users || '0'),
      comments: parseInt(result.rows[0]?.comments || '0')
    };
  } catch (e) {
    console.error('Failed to fetch stats', e);
  }

  const statItems = [
    {
      label: '文章数量',
      value: stats.posts,
      Icon: RiArticleLine,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      label: '注册用户',
      value: stats.users,
      Icon: RiUserAddLine,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      label: '留言数量',
      value: stats.comments,
      Icon: RiChat3Line,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 dark:border-gray-800"
        >
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
            style={{
              background: `linear-gradient(135deg, ${item.color.split(' ')[0].replace('from-', '')}, ${item.color.split(' ')[1].replace('to-', '')})`
            }}
          />

          <div className="relative flex items-center gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${item.bgColor} text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform duration-300`}>
              <item.Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                {item.value}
              </p>
            </div>
          </div>

          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
        </div>
      ))}
    </div>
  );
}
