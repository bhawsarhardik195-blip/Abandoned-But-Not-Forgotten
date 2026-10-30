/**
 * ABANDONED BUT NOT FORGOTTEN & RED HORIZON
 * Unified Dual-Story Database Router
 */

const STORY_DATABASE = {
  mars: typeof MARS_STORY_DATA !== 'undefined' ? MARS_STORY_DATA : null,
  moon: typeof MOON_STORY_DATA !== 'undefined' ? MOON_STORY_DATA : null
};

let CURRENT_ACTIVE_STORY_ID = 'mars';
let STORY_DATA = STORY_DATABASE.mars || STORY_DATABASE.moon;

function setActiveStory(storyId) {
  if (STORY_DATABASE[storyId]) {
    CURRENT_ACTIVE_STORY_ID = storyId;
    STORY_DATA = STORY_DATABASE[storyId];
    return STORY_DATA;
  }
  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STORY_DATABASE, MARS_STORY_DATA: typeof MARS_STORY_DATA !== 'undefined' ? MARS_STORY_DATA : null, MOON_STORY_DATA: typeof MOON_STORY_DATA !== 'undefined' ? MOON_STORY_DATA : null };
} else {
  window.STORY_DATABASE = STORY_DATABASE;
  window.setActiveStory = setActiveStory;
  window.STORY_DATA = STORY_DATA;
}
