import { useEffect, useState } from 'react';

export default function LandscapeOverlay() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // 화면 너비가 768px 이하이면서, 세로 길이가 더 긴 경우(모바일 세로 모드) 감지
      const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
      const portrait = window.innerHeight > window.innerWidth;
      
      setIsPortrait(isMobile && portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="landscape-overlay">
      <div className="landscape-content fade-in">
        <div className="device-animation">
          <div className="phone-icon"></div>
        </div>
        <h2>가로 모드로<br/>변경해 주세요</h2>
        <p>
          CLASS GALLERY는<br/>
          가로 화면에 최적화되어 있습니다.<br/>
          스마트폰을 눕혀서 더 넓게 감상해 보세요!
        </p>
      </div>
    </div>
  );
}
