import React from 'react';

export const AnnouncementBar: React.FC = () => {
  return (
    <aside aria-label="Announcement" className="bg-[#ff4600] text-white text-[11px] font-semibold tracking-widest uppercase py-2 px-4 text-center overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-marquee">
        COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS OVER $250 &bull; COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS OVER $250
      </div>
    </aside>
  );
};
