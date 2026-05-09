import React from 'react';

interface FeedItem {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

interface GroupFeedProps {
  items: FeedItem[];
}

const GroupFeed: React.FC<GroupFeedProps> = ({ items }) => (
  <section className="group-feed" aria-label="그룹 피드">
    {items.length === 0 ? (
      <p>아직 피드가 없어요. 첫 번째 기록을 남겨보세요! 🌱</p>
    ) : (
      <ul className="feed-list">
        {items.map(item => (
          <li key={item.id} className="feed-item">
            <strong>{item.userName}</strong>
            <p>{item.message}</p>
            <time dateTime={item.createdAt}>{item.createdAt.slice(0, 10)}</time>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default GroupFeed;
