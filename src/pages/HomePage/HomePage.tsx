import { HeroSection } from "../../components/HeroSection";
import { usePublicPath } from "../../hooks/usePublicPath";
import { CSSProperties } from "react";

const fullScreenWrapper: CSSProperties = {
  marginBlock: -30,
  marginInline: -15,
  width: "calc(100% + 30px)",
  height: "calc(100vh - 64px - 70px)",
  minHeight: "calc(100vh - 64px - 70px)",
  maxHeight: "calc(100vh - 64px - 70px)",
  display: "flex",
  overflow: "hidden",
};

const HomePage = () => {
  const bgImage = usePublicPath("bg.jpg");
  return (
    <div style={fullScreenWrapper}>
      <HeroSection
        title="Игры ждут тебя"
        subtitle="Исследуй каталог и открой для себя миры, которые станут частью твоей истории"
        buttonText="Перейти в каталог"
        buttonLink="/games"
        backgroundImage={bgImage}
      />
    </div>
  );
};

export default HomePage;
