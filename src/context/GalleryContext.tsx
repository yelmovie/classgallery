import React, { createContext, useContext, useReducer } from 'react';
import type { Artwork, GalleryAction, GalleryState, SpeedMode } from '../types/artwork';
import type { ThemeId } from '../types/theme';
import { DEFAULT_THEME_ID } from '../constants/themes';

const initialState: GalleryState = {
  currentTheme: DEFAULT_THEME_ID,
  selectedBackgroundId: null, // null = 테마의 default 사용
  artworks: [],
  speedMode: 'slow',
  spotlightEnabled: true,
  currentSpotlightIndex: 0,
};

function galleryReducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case 'SET_THEME':
      // 테마 변경 시 기존 artworks 는 비우고 (이전 테마 cropArea 로 처리된 이미지),
      // selectedBackgroundId 도 null 로 reset → 새 테마의 default 가 적용된다.
      if (state.currentTheme === action.payload) return state;
      return {
        ...state,
        currentTheme: action.payload,
        selectedBackgroundId: null,
        artworks: [],
        currentSpotlightIndex: 0,
      };
    case 'SET_BACKGROUND':
      return { ...state, selectedBackgroundId: action.payload };
    case 'ADD_ARTWORKS': {
      const next = [...state.artworks, ...action.payload].slice(0, 30);
      return { ...state, artworks: next };
    }
    case 'SET_ARTWORKS':
      return { ...state, artworks: action.payload.slice(0, 30) };
    case 'REMOVE_ARTWORK':
      return { ...state, artworks: state.artworks.filter((a) => a.id !== action.payload) };
    case 'CLEAR_ALL':
      return { ...state, artworks: [], currentSpotlightIndex: 0 };
    case 'SET_SPEED':
      return { ...state, speedMode: action.payload };
    case 'SET_SPOTLIGHT':
      return { ...state, spotlightEnabled: action.payload };
    case 'ADVANCE_SPOTLIGHT': {
      if (state.artworks.length === 0) return state;
      const next = (state.currentSpotlightIndex + 1) % state.artworks.length;
      return { ...state, currentSpotlightIndex: next };
    }
    default:
      return state;
  }
}

interface GalleryContextValue {
  state: GalleryState;
  dispatch: React.Dispatch<GalleryAction>;
  addArtworks: (artworks: Artwork[]) => void;
  removeArtwork: (id: string) => void;
  clearAll: () => void;
  setSpeed: (mode: SpeedMode) => void;
  setSpotlight: (enabled: boolean) => void;
  advanceSpotlight: () => void;
  setTheme: (themeId: ThemeId | string) => void;
  setBackground: (backgroundId: string | null) => void;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(galleryReducer, initialState);

  const addArtworks = (artworks: Artwork[]) =>
    dispatch({ type: 'ADD_ARTWORKS', payload: artworks });

  const removeArtwork = (id: string) => {
    const artwork = state.artworks.find((a) => a.id === id);
    if (artwork) {
      if (artwork.originalPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(artwork.originalPreviewUrl);
      if (artwork.cutoutUrl.startsWith('blob:')) URL.revokeObjectURL(artwork.cutoutUrl);
    }
    dispatch({ type: 'REMOVE_ARTWORK', payload: id });
  };

  const clearAll = () => {
    state.artworks.forEach((a) => {
      if (a.originalPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(a.originalPreviewUrl);
      if (a.cutoutUrl.startsWith('blob:')) URL.revokeObjectURL(a.cutoutUrl);
    });
    dispatch({ type: 'CLEAR_ALL' });
  };

  const setSpeed = (mode: SpeedMode) => dispatch({ type: 'SET_SPEED', payload: mode });
  const setSpotlight = (enabled: boolean) => dispatch({ type: 'SET_SPOTLIGHT', payload: enabled });
  const advanceSpotlight = () => dispatch({ type: 'ADVANCE_SPOTLIGHT' });
  const setTheme = (themeId: ThemeId | string) => dispatch({ type: 'SET_THEME', payload: themeId });
  const setBackground = (backgroundId: string | null) =>
    dispatch({ type: 'SET_BACKGROUND', payload: backgroundId });

  return (
    <GalleryContext.Provider
      value={{ state, dispatch, addArtworks, removeArtwork, clearAll, setSpeed, setSpotlight, advanceSpotlight, setTheme, setBackground }}
    >
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery(): GalleryContextValue {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error('useGallery must be used within GalleryProvider');
  return ctx;
}
