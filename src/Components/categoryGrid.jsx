import React, { useContext } from "react";
import { useOtherContexts } from "@/Contexts/otherContexts";
import { useRouter } from "next/navigation";
import GENRES from "@/data/genres.json";

// Card: fills its parent, maxes at 1fr, min at 200px for sm view
const CategoryCard = ({ title, image, bgColor, onClick, cardHeight, cardPadding, cardFont }) => (
  <div
    className="relative rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 flex-1"
    style={{
      backgroundColor: bgColor,
      minWidth: 0,
      height: cardHeight,
      padding: cardPadding,
      display: "flex",
      alignItems: "center",
    }}
    onClick={onClick}
  >
    <h3 className={`text-white font-bold ${cardFont} relative z-1`}>{title}</h3>
    {/* <img
      src={image}
      alt={title}
      className="max-w-25 max-h-25  z-0 absolute bottom-0 right-0 rotate-[25deg] translate-x-2 translate-y-2 shadow-2xs  shadow-black rounded-sm"
    /> */}
  </div>
);

const categories = GENRES.map(({ name, color }) => ({
  title: name,
  image: "/images/notfound.png",
  bgColor: color || "#283ea8",
}));

const getColumns = (middleWidth) => {
  // Minimum 2 columns, max as many as fit 270px per card
  if (middleWidth < 500) return 2;
  if (middleWidth < 800) return 3;
  if (middleWidth < 1200) return 4;
  return Math.max(4, Math.floor(middleWidth / 270));
};

const getCardSize = (middleWidth) => {
  // For small view, make cards smaller
  if (middleWidth < 500) {
    return {
      cardHeight: "70px",
      cardPadding: "0.75rem",
      cardFont: "text-base",
    };
  }
  if (middleWidth < 800) {
    return {
      cardHeight: "100px",
      cardPadding: "1rem",
      cardFont: "text-lg",
    };
  }
  return {
    cardHeight: "150px",
    cardPadding: "1.25rem",
    cardFont: "text-lg",
  };
};

const CategoryGrid = () => {
  const { middleWidth } = useOtherContexts();
  const router = useRouter();

  const columns = getColumns(middleWidth);
  const cardGap = 16; // px

  // Responsive container width: fill parent, max at 1200px
  const containerStyle = {
    width: "100%",
    maxWidth: Math.min(middleWidth, 1200),
    margin: "0 auto",
  };

  // Flex wrap for rows, min 2 per row, max auto
  const rowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: `${cardGap}px`,
  };

  // Card width: responsive, min 0, max 1fr, but at least 200px for sm
  const minCardWidth = middleWidth < 500 ? 120 : 200;
  const cardStyle = {
    flex: `1 1 calc(${100 / columns}% - ${cardGap}px)`,
    minWidth: `${minCardWidth}px`,
    maxWidth: `calc(${100 / columns}% - ${cardGap}px)`,
    boxSizing: "border-box",
    display: "flex",
  };

  const { cardHeight, cardPadding, cardFont } = getCardSize(middleWidth);

  const renderRow = (cats) =>
    cats.map((cat, idx) => (
      <div key={idx} style={cardStyle}>
        <CategoryCard
          {...cat}
          onClick={() => router.push(`/genres/${encodeURIComponent(cat.title)}`)}
          cardHeight={cardHeight}
          cardPadding={cardPadding}
          cardFont={cardFont}
        />
      </div>
    ));

  return (
    <div
      className="sm:p-6 space-y-8 h-full text-white z-10 pb-10"
      style={containerStyle}
    >
      <h2 className="text-lg sm:text-2xl font-bold mb-4">Start browsing</h2>
      <div style={rowStyle}>
        {renderRow(categories.slice(0, 12))}
      </div>

      <h2 className=" text-lg sm:text-2xl font-bold mb-4">Browse all</h2>
      <div style={rowStyle}>
        {renderRow(categories.slice(12))}
      </div>
    </div>
  );
};

export default React.memo(CategoryGrid);
