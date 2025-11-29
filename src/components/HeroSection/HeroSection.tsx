import { Typography } from "antd";
import { Link } from "react-router-dom";
import { useHeroSectionStyles } from "./styles";

const { Title, Paragraph } = Typography;

interface HeroSectionProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
}

export const HeroSection = ({
  title,
  subtitle,
  buttonText,
  buttonLink,
  backgroundImage,
}: HeroSectionProps) => {
  const styles = useHeroSectionStyles();

  return (
    <section style={styles.container(backgroundImage)}>
      <Title style={styles.title}>{title}</Title>
      <Paragraph style={styles.subtitle}>{subtitle}</Paragraph>

      <Link to={buttonLink} style={styles.link} className="hero-link">
        {buttonText}
      </Link>
    </section>
  );
};
