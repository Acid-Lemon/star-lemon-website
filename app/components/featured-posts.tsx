import Link from 'next/link';
import db from '../../lib/db';
import { getPublicUrl } from '../../lib/oss';

interface Post {
  id: number;
  title: string;
  summary: string;
  cover: string;
  created_at: string;
  tags: string;
  author_name: string;
  author_avatar: string | null;
}

export async function FeaturedPosts() {
  let posts: Post[] = [];

  try {
    const result = await db.query(`
      SELECT posts.id, posts.title, posts.summary, posts.cover, posts.created_at, posts.tags, users.nickname as author_name, users.avatar as author_avatar
      FROM posts
      LEFT JOIN users ON posts.author_id = users.id
      ORDER BY posts.created_at DESC
      LIMIT 3
    `);
    posts = await Promise.all(
      result.rows.map(async (row: any) => ({
        ...row,
        cover: await getPublicUrl(row.cover),
        author_avatar: await getPublicUrl(row.author_avatar),
      }))
    );
  } catch (e) {
    console.error('Failed to fetch featured posts', e);
  }

  if (posts.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
    ];
    const index = tag.length % colors.length;
    return colors[index];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((post, index) => (
        <Link key={post.id} href={`/post/${post.id}`}>
          <article className="group h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-800">
            <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 overflow-hidden">
              {post.cover ? (
                <img
                    src={post.cover}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-orange-200/30 dark:bg-orange-800/20 blur-xl" />
                  <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-blue-200/30 dark:bg-blue-800/20 blur-xl" />
                  <div className="absolute top-6 left-6">
                    <span className="text-5xl font-bold text-gray-200 dark:text-gray-700 group-hover:text-orange-200 dark:group-hover:text-orange-700 transition-colors duration-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </>
              )}

              {post.tags && (
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  {(() => {
                    const tagsArray: string[] = Array.isArray(post.tags)
                      ? post.tags
                      : typeof post.tags === 'string'
                        ? post.tags.split(',')
                        : [];
                    return tagsArray.slice(0, 2).map((tag: string, i: number) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag.trim())}`}
                      >
                        {tag.trim()}
                      </span>
                    ));
                  })()}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt={post.author_name} className="rounded-full object-cover w-8 h-8" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    {post.author_name?.charAt(0) || 'A'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{post.author_name || '匿名'}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(post.created_at)}</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 line-clamp-2">
                {post.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-4">
                {post.summary}
              </p>

              <div className="flex items-center text-sm text-orange-500 dark:text-orange-400 font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                阅读全文
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
