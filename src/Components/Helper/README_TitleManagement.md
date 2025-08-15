# Title Management System

This system automatically manages page titles with priority for currently playing songs.

## How It Works

1. **Song Priority**: When a song is playing, the title shows: `"Song Name - Fake Spotify"`
2. **Page Titles**: When no song is playing, page-specific titles are shown
3. **Automatic Switching**: Titles automatically switch between song and page titles

## Usage Examples

### Method 1: Using PageTitle Component (Recommended)

```jsx
import { PageTitle } from "@/Components/Helper/PageTitle";

function MyPage() {
  return (
    <>
      <PageTitle title="My Page - Fake Spotify" />
      {/* Your page content */}
    </>
  );
}
```

### Method 2: Using useTitleManager Hook

```jsx
import { useTitleManager } from "@/Components/Helper/useTitleManager";
import { usePlayer } from "@/Contexts/playerContext";

function MyPage() {
  const { currentSong, isPlaying } = usePlayer();
  const { setPageTitle } = useTitleManager("My Page - Fake Spotify", currentSong, isPlaying);

  useEffect(() => {
    setPageTitle("My Page - Fake Spotify");
  }, [setPageTitle]);

  return (
    // Your page content
  );
}
```

### Method 3: In Layout Files

```jsx
// In layout.js files
import { useTitleManager } from "@/Components/Helper/useTitleManager";
import { usePlayer } from "@/Contexts/playerContext";

function MyLayout({ children }) {
  const { currentSong, isPlaying } = usePlayer();
  const { setPageTitle } = useTitleManager("My Section - Fake Spotify", currentSong, isPlaying);

  useEffect(() => {
    setPageTitle("My Section - Fake Spotify");
  }, [setPageTitle]);

  return <>{children}</>;
}
```

## Title Priority

1. **Song Playing**: `"Song Name - Fake Spotify"`
2. **No Song**: Page-specific title (e.g., `"Home - Fake Spotify"`)
3. **Default**: `"Fake Spotify"`

## Features

- ✅ Automatic song title when music is playing
- ✅ Page titles when no music is playing
- ✅ Smooth transitions between titles
- ✅ No conflicts between different components
- ✅ Works with route changes
- ✅ Respects user's music listening experience

## Components Updated

- `Providers.jsx` - Global title management
- `AudioComponent.jsx` - Removed manual title setting
- `artistDashboard/layout.js` - Uses title manager
- `search/layout.js` - Uses title manager
- `home/page.js` - Example with PageTitle component
