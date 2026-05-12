import { useState } from 'react';
import { isContactFormUrlConfigured, siteConfig } from '../../constants/siteConfig';
import InfoModal from './InfoModal';

export default function ContactButton() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    if (isContactFormUrlConfigured(siteConfig.contactFormUrl)) {
      window.open(siteConfig.contactFormUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={handleClick}
        aria-label="문의하기 — 새 탭으로 열림"
      >
        문의하기
      </button>
      <InfoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="문의하기"
        body={<p style={{ margin: 0 }}>문의 링크가 아직 설정되지 않았습니다. 관리자에게 문의해 주세요.</p>}
      />
    </>
  );
}
