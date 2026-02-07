import React from 'react';
import '../styles/skeleton.css';

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-img skeleton-pulse" />
    <div className="skeleton-text skeleton-pulse" style={{ width: '80%' }} />
    <div className="skeleton-text skeleton-pulse" style={{ width: '50%' }} />
  </div>
);

export const SkeletonSongRow = () => (
  <div className="skeleton-row">
    <div className="skeleton-circle skeleton-pulse" style={{ width: 24, height: 24 }} />
    <div className="skeleton-circle skeleton-pulse" style={{ width: 44, height: 44, borderRadius: 6 }} />
    <div className="skeleton-row-info">
      <div className="skeleton-text skeleton-pulse" style={{ width: '60%' }} />
      <div className="skeleton-text skeleton-pulse" style={{ width: '40%', height: 10 }} />
    </div>
  </div>
);

export const SkeletonPlaylistHeader = () => (
  <div className="skeleton-playlist-header">
    <div className="skeleton-cover skeleton-pulse" />
    <div className="skeleton-header-info">
      <div className="skeleton-text skeleton-pulse" style={{ width: '50%', height: 28 }} />
      <div className="skeleton-text skeleton-pulse" style={{ width: '30%' }} />
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <div className="skeleton-dashboard">
    <div className="skeleton-stats">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-stat-card skeleton-pulse" />
      ))}
    </div>
    <div className="skeleton-text skeleton-pulse" style={{ width: '30%', height: 24, marginTop: 32 }} />
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="skeleton-row" style={{ marginTop: 8 }}>
        <div className="skeleton-circle skeleton-pulse" style={{ width: 44, height: 44, borderRadius: 6 }} />
        <div className="skeleton-row-info">
          <div className="skeleton-text skeleton-pulse" style={{ width: '50%' }} />
          <div className="skeleton-text skeleton-pulse" style={{ width: '30%', height: 10 }} />
        </div>
      </div>
    ))}
  </div>
);
