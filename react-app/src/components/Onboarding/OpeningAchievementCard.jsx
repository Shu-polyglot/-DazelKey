/*
  A stripped-down cousin of Achievements/AchievementCard for the opening
  sequence: same photo + scrim + caption design language, but photo-first
  and metadata-free (no mode, index, date, or place) since here a card is
  a life moment appearing in the world, not a dashboard list item -- and
  it isn't clickable, so it doesn't share AchievementCard's layoutId/
  onOpen wiring. Only ever rendered for achievements that already have a
  photo (see pickOpeningAchievements), so there is no no-photo fallback.
*/
function OpeningAchievementCard({ image, caption, size }) {
  return (
    <div className={`opening-card-frame opening-card-frame--${size}`}>
      <div className="opening-card-photo" style={{ backgroundImage: `url(${image})` }} />
      <div className="opening-card-scrim" />
      {caption && <p className="opening-card-caption">{caption}</p>}
    </div>
  );
}

export default OpeningAchievementCard;
