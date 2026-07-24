import type { ResponseEntity } from "~/types/common";
import type { FavoriteMenu } from "~/types/models";

export const useFavoriteMenuApi = () => {
  const api = useApi()
  const createFavorite = async (request: FavoriteMenu): Promise<ResponseEntity<FavoriteMenu> | null> => {
    return api<ResponseEntity<FavoriteMenu>>('/api/favorite-menu', {
      method: 'POST',
      body: request
    })
  };
  const deleteFavorite = async (request: FavoriteMenu): Promise<ResponseEntity<void> | null> => {
    return api<ResponseEntity<void>>('/api/favorite-menu', {
      method: 'DELETE',
      body: request
    })
  };

  return {
    createFavorite,
    deleteFavorite
  }
}
