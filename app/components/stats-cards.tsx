import db from '../../lib/db';

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
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      label: '注册用户',
      value: stats.users,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      label: '留言数量',
      value: stats.comments,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
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
              {item.icon}
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
