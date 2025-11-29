import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { CardsGrid } from "../../components/CardsGrid";
import { ItemsPagination } from "../../components/ItemsPagination";
import { CategoriesToggle } from "../../components/CategoriesToggle";
import { useCatalogData } from "../../hooks/useCatalogData";
import { useCatalogPageStyles } from "./styles";
import { ContentLoader } from "../../components/ContentLoader";
import { MAX_PAGES, PAGE_SIZE } from "./constants";

const CatalogPage = () => {
  const navigate = useNavigate();
  const styles = useCatalogPageStyles();
  const {
    displayedGames,
    total,
    isEmpty,
    isLoadingData,
    showFavorites,
    page,
    setPage,
    handleShowFavorites,
    handleDelete,
  } = useCatalogData();
  const maxTotalItems = Math.min(total, MAX_PAGES * PAGE_SIZE);

  return (
    <div style={styles.container}>
      <div style={styles.catalogTop}>
        <CategoriesToggle
          value={showFavorites ? "favorites" : "all"}
          onChange={handleShowFavorites}
        />
        <Button
          type="primary"
          onClick={() => navigate("/create-game")}
          style={{ marginBottom: 16 }}
        >
          + Добавить игру
        </Button>
      </div>

      <ContentLoader loading={isLoadingData} isEmpty={isEmpty} fullscreen>
        <>
          <CardsGrid
            games={displayedGames}
            onDelete={handleDelete}
            isFavoriteView={showFavorites}
          />
          {!showFavorites && (
            <ItemsPagination
              currentPage={page}
              total={maxTotalItems}
              onChange={setPage}
            />
          )}
        </>
      </ContentLoader>
    </div>
  );
};

export default CatalogPage;
